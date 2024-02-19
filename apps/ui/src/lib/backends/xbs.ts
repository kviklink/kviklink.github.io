// Import //////////////////////////////////////////////////////////////////////
import { Result, Ok, Err, Option, None, Some } from 'ts-results'
import { XbsBuilder, type Xbs, Folder, Bookmark } from 'xbs'
import type { IBookmark, IBackend, IBackendBuilder } from '.'
import { z } from 'zod'
import { toValue } from 'ts-results-utils'
import { hostnameFromUrl } from '../utils/hostname'
import type { XbsData } from 'xbs/src/data'

// Constants ///////////////////////////////////////////////////////////////////
const CACHE_THRESHOLD = 2_000 // 2 seconds

// Builder /////////////////////////////////////////////////////////////////////
export const XbsBackendBuilder: IBackendBuilder = {
    /**
     * In case of xBrowserSync "login" means that
     *  -   the provided plaintext password is hashed+salted
     *  -   request to the server is made to make sure the password is correct
     *
     * @param credentials as `{ syncId: string, password: string}`
     * @returns {Result<IBackend, string>}
     */
    login: async (credentials: Record<string, unknown>): Promise<Result<IBackend, string>> => {
        // Validate and parse credentials
        const schema = z.object({
            syncId  : z.string().min(1),
            password: z.string().min(1)
        }).strict();

        const parsed = schema.safeParse(credentials)
        if (!parsed.success) { return Err(parsed.error.toString()) }

        // Create Xbs client with XbsBuilder (using plaintext credentials)
        const xbs = await new XbsBuilder()
            .setCredentials(parsed.data.syncId, parsed.data.password)
            .finish()

        if (xbs.err) { return Err(xbs.val) }

        // Execute 'get' to make sure everything works
        const res = await xbs.val.get()
        if (res.err) { return Err(res.val) }

        // Return Xbs backend
        return Ok(new XbsBackend(xbs.val))
    },

    auth: async (credentials: unknown): Promise<Result<IBackend, string>> => {
        // Validate and parse credentials
        const schema = z.object({
            syncId      : z.string().min(1),
            base64key   : z.string().min(1)
        }).strict();

        const parsed = schema.safeParse(credentials)
        if (!parsed.success) { return Err(parsed.error.toString()) }

        // Create Xbs client with XbsBuilder (using plaintext credentials)
        const xbs = await new XbsBuilder()
            .setRawCredentials(parsed.data.syncId, parsed.data.base64key)
            .finish()

        if (xbs.err) { return Err(xbs.val) }

        // Execute 'get' to make sure everything works
        const res = await xbs.val.get()
        if (res.err) { return Err(res.val) }

        // Return Xbs backend
        return Ok(new XbsBackend(xbs.val))
    },
}

// Backend /////////////////////////////////////////////////////////////////////
export class XbsBackend implements IBackend {
    // Attributes //////////////////////////////////////////////////////////////
    private xbs: Xbs

    // Cache
    private cache: Option<XbsData>

    // Stores the timestamp of when data was last fetched from the backend.
    // This can be used to prevent re-fetching multiple times in a very short
    // period of time.
    // Unix timestamp in milliseconds (`Date.now()`).
    private cacheAge: number = 0

    // Constructor /////////////////////////////////////////////////////////////
    public constructor(xbs: Xbs) {
        this.xbs = xbs; this.cache = None
    }

    // IBookmark Methods ///////////////////////////////////////////////////////
    canRead(): true { return true }
    canManage(): boolean { return false }
    canStoreConfig(): boolean { return false }
    getCredentials(): Record<string, unknown> {
        return {
            syncId: this.xbs.syncId,
            base64key: this.xbs.base64key,
        }
    }

    // Private Methods /////////////////////////////////////////////////////////
    private async loadFromCacheOrApi(force?: boolean): Promise<Result<XbsData, string>> {
        // If force is false: try to use cache
        if (
            force === false &&
            this.cache.some &&                              // cache set?
            (Date.now() - this.cacheAge) < CACHE_THRESHOLD  // cache valid?
        ) {
            console.log('[CACHE HIT] XbsBackend')
            return Ok(this.cache.val)

        } else {
            // Get data from xBrowserSync
            const data = await this.xbs.get()
            if (data.err) { return Err(data.val) }

            // Set cache
            this.cache = Some(data.val)
            this.cacheAge = Date.now()

            return Ok(data.val)
        }
    }

    // IBookmarkReader Methods /////////////////////////////////////////////////
    /**
     * TODO: docs
     */
    async get(force: boolean = false): Promise<Result<IBookmark[], string>> {
        // Get data
        const data = await this.loadFromCacheOrApi(force)
        if (data.err) { return Err(data.val) }

        // Perform search
        const bookmarks = data.val.findAllBookmarks()

        // Transform and return
        return Ok(bookmarks.map(item => { return {
            id          : item.id,
            title       : toValue(item.title) || '',
            description : toValue(item.description) || '',
            url         : item.url,
            tags        : item.tags,
            note        : '',
            metadata    : {
                path    : getAncestors(item),
                hostname: hostnameFromUrl(item.url),
            }
        }}))
    }

    async findBookmarkById(id: number): Promise<Result<Option<IBookmark>, string>> {
        // Get data
        const data = await this.loadFromCacheOrApi()
        if (data.err) { return Err(data.val) }

        // Perform search
        const bookmark = data.val.findBookmarkById(id)

        // Transform and return
        return Ok(bookmark.map(item => { return {
            id          : item.id,
            title       : toValue(item.title) || '',
            description : toValue(item.description) || '',
            url         : item.url,
            tags        : item.tags,
            note        : '',
            metadata    : {
                path    : getAncestors(item),
                hostname: hostnameFromUrl(item.url),
            }
        }}))
    }

    ////////////////////////////////////////////////////////////////////////////
}

// Helper Functions ////////////////////////////////////////////////////////////

/**
 * Function returns the ancestors of a folder/bookmark in correct order.
 */
function getAncestors(item: Folder | Bookmark): string[] {
    // Start with empty path because the current folder/bookmark title should
    // not be included.
    const path = []

    // Pointer to the current item's parent
    let parent = item._parent

    // While the current item has a parent and a grandparent,
    // add the parent's title to the path.
    while (parent.some) {
        // Unwrap option
        const par = parent.val

        // If parent is not the root node...
        if (par.id === -1) { break }

        // ...add the parent's title to the path
        path.push( toValue(par.title) || '' )

        // Move pointer to parent's parent
        parent = par._parent
    }

    return path.reverse()
}

/**
 * Alternatively to calculating the ancestors for every folder/bookmark,
 * the "parent" information can be injected while traversing the data structure
 * (e.g. the depth-first search).
 * The following (commented out) code shows an example of how this works.
 *
 * Note: For this to work the datastructure must be changed to accomodate this
 * information!
 */
// interface Item {
//     id: number,
//     parents?: number[],
//     children: Item[]
// }
//
// const stack: Item[] = [...items]
// const result: Item[] = []

// while (stack.length > 0) {
//     // Get item from stack
//     const item = stack.pop()!

//     // Add item to results
//     result.push({ id: item.id, children: [], parents: item.parents })

//     // Inject "parent"-information into children
//     item.children.map(c => c.parents = [...(item.parents || []), item.id])

//     // Add children to stack
//     stack.push(...item.children)

// }

////////////////////////////////////////////////////////////////////////////////
