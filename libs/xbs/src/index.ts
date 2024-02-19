// Re-Exports //////////////////////////////////////////////////////////////////
export { XbsBuilder } from './builder'
export { Folder, Bookmark } from './data'

// Imports /////////////////////////////////////////////////////////////////////
import { Err, None, Ok, Option, Result } from 'ts-results'
import { XbsData } from './data'
import { CryptoUtils } from './utils'
import { type IBookmark, type IFolder, parse } from './parser'
import { getBookmarks, getLastUpdated, updateBookmarks, } from './api'

// Class ///////////////////////////////////////////////////////////////////////

/**
 * TODO: add documentation.
 */
export class Xbs {
    // Attributes //////////////////////////////////////////////////////////////
    public readonly baseUrl: string
    public readonly version: string
    public readonly syncId: string
    public readonly base64key: string

    // Cached 'lastUpdated' value from last GET request
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

    // Public Methods //////////////////////////////////////////////////////////

    /**
     * Get the bookmark data from xBrowserSync.
     */
    public async get(): Promise<Result<XbsData, string>> {
        // Get data from API
        const res = await getBookmarks(this.baseUrl, this.syncId)
        if (res.err) { return Err(res.val.toString()) }

        // Decrypt data
        const dec = await this.decrypt(res.val.bookmarks)
        if (dec.err) { return Err(dec.val) }

        // Parse decrypted data
        const par = parse(dec.val)
        if (par.err) { return Err(par.val.toString()) }

        // Create and set state
        const data = XbsData.from(par.val, res.val.lastUpdated)
        if (data.err) { return Err(data.val) }

        // Return
        return Ok(data.val)
    }

    /**
     * Update bookmars on xBrowserSync.
     */
    public async put(data: XbsData): Promise<Result<null, string>> {
        // Encrypt the data
        const enc = await this.encrypt(data.toXbs())
        if (enc.err) { return Err(enc.val) }

        // Send request to API
        const res = await updateBookmarks(this.baseUrl, this.syncId, {
            bookmarks: enc.val, lastUpdated: data.lastUpdated,
        })
        if (res.err) { return Err(res.val.toString()) }

        // Return
        return Ok(null)
    }

    /**
     * Get lastUpdated
     */
    public async getLastUpdated(): Promise<Result<string, string>> {
        // Get data from API
        const res = await getLastUpdated(this.baseUrl, this.syncId)
        if (res.err) { return Err(res.val.toString()) }

        // Return
        return Ok(res.val.lastUpdated)
    }

    ////////////////////////////////////////////////////////////////////////////
}

////////////////////////////////////////////////////////////////////////////////
