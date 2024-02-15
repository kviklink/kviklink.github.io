// Re-Exports //////////////////////////////////////////////////////////////////
export { XbsBuilder } from './builder'
export { Folder, Bookmark } from './state'

// Imports /////////////////////////////////////////////////////////////////////
import { Err, None, Ok, Option, Result, Some } from 'ts-results'
import { XbsState, Bookmark, Folder } from './state'
import { CryptoUtils } from './utils'
import { IBookmark, IFolder, parse } from './parser'
import { getBookmarks, updateBookmarks } from './api'

// Class ///////////////////////////////////////////////////////////////////////

/**
 * TODO: add documentation.
 */
export class Xbs {
    // Private Attributes //////////////////////////////////////////////////////
    private baseUrl: string
    private version: string
    private syncId: string
    private base64key: string

    private state: Option<XbsState> = None
    private lastUpdated: Option<string> = None

    // Constructor /////////////////////////////////////////////////////////////
    constructor(url: string, ver: string, syncId: string, key: string) {
        this.baseUrl = url
        this.version = ver
        this.syncId = syncId
        this.base64key = key
    }

    // Private Methods /////////////////////////////////////////////////////////
    /**
     * Dectypt the encrypted string into an object.
     */
    private async decrypt(enc: string): Promise<Result<unknown, string>> {
        // Decrypt the data.
        const decResult = await Result.wrapAsync(
            () => CryptoUtils.decrypt(this.base64key, enc)
        )

        if (decResult.err) { return Err('failed to decrypt') }

        // Parse decrypted data as JSON
        const json = Result.wrap(() => JSON.parse(decResult.val))
        if (json.err) { return Err('failed to parse to JSON') }

        // Return
        return Ok(json.val)
    }

    /**
     * Encrypt the xBrowserSync data into `string`.
     */
    private async encrypt(
        plain: (IFolder | IBookmark)[]
    ): Promise<Result<string, string>> {
        // Stringify data
        const str = Result.wrap(() => JSON.stringify(plain))
        if (str.err) { return Err('failed to stringify data') }

        // Encrypt data
        const encResult = await Result.wrapAsync(
            () => CryptoUtils.encrypt(this.base64key, str.val)
        )
        if (encResult.err) { return Err('failed to encrypt data') }

        // Return
        return Ok(encResult.val)
    }

    /**
     * Get the bookmark data from xBrowserSync and set the internal state of
     * this library.
     */
    private async setState(): Promise<Result<XbsState, string>> {
        // Get data from API
        const data = await getBookmarks(this.baseUrl, this.syncId)
        if (data.err) { return Err(data.val.getErrors()[0].message) }

        // Decrypt data
        const dec = await this.decrypt(data.val.bookmarks)
        if (dec.err) { return Err(dec.val) }

        // Parse decrypted data
        const par = parse(dec)
        if (par.err) { return Err(par.val.toString()) }

        // Create and set state
        const state = XbsState.from(par.val)
        if (state.err) { return Err(state.val) }

        // Set state and last updated
        this.state = Some(state.val)
        this.lastUpdated = Some(data.val.lastUpdated)

        // Return
        return Ok(state.val)
    }

    /**
     * Take the internal state of this library and update the remote data of
     * xBrowserSync.
     */
    private async uploadState(): Promise<Result<null, string>> {
        // Get state and last updated
        if (this.state.none) { return Err('no state') }
        if (this.lastUpdated.none) { return Err('no last upadted') }

        // Get data from state
        const data = this.state.val.toXbs()

        // Encrypt the data
        const enc = await this.encrypt(data)
        if (enc.err) { return Err(enc.val) }

        // Send request to API
        const res = await updateBookmarks(this.baseUrl, this.syncId, {
            bookmarks: enc.val,
            lastUpdated: this.lastUpdated.val
        })
        if (res.err) { return Err(res.val.getErrors()[0].message) }

        // Return
        return Ok(null)
    }

    // Public Methods //////////////////////////////////////////////////////////

    public async get(): Promise<Result<(Folder | Bookmark)[], string>> {
        // Set (and return) state
        const state = await this.setState()
        if (state.err) { return Err(state.val) }

        // Return
        return Ok(state.val.root.children)
    }

    // public async move(src: number, dst: number): Promise<Result<null, string>> {
    //     // Get state first
    //     if (this.state.none) {
    //         const set = await this.setState()
    //         if (set.err) { return Err(set.val) }
    //     }

    //     // Make sure the state was actually set
    //     if (this.state.none) { return Err('internal error') }

    //     // Mutate state
    //     const succ = this.state.val.move(src, dst)
    //     if (succ.err) { return Err(succ.val) }

    //     // Upload state
    //     const res = await this.uploadState()
    //     if (res.err) { return Err(res.val) }
    //     return Ok(null)
    // }

    ////////////////////////////////////////////////////////////////////////////
}

////////////////////////////////////////////////////////////////////////////////
