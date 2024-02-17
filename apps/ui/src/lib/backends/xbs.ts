// Import //////////////////////////////////////////////////////////////////////
import { Result, Ok, Err } from 'ts-results'
import { XbsBuilder, type Xbs, Folder, Bookmark } from 'xbs'
import type { IBookmark, IBackend, IBackendBuilder } from '.'
import { z } from 'zod'
import { toValue } from 'ts-results-utils'
import { hostnameFromUrl } from '../utils/hostname'

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

    // Constructor /////////////////////////////////////////////////////////////
    public constructor(xbs: Xbs) { this.xbs = xbs }

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

    // IBookmarkReader Methods /////////////////////////////////////////////////
    async get(): Promise<Result<IBookmark[], string>> {
        // Get tree-structure from xBrowserSync
        const tree = await this.xbs.get()
        if (tree.err) { return Err(tree.val) }

        // Perform depth-first search to find all bookmarks and transform them
        // to the expected `IBookmark` interface.
        const stack = tree.val
        const results: IBookmark[] = []

        while (stack.length > 0) {
            const item = stack.pop()!

            if (item instanceof Bookmark) {
                results.push({
                    id          : item.data.id,
                    title       : toValue(item.data.title) || '',
                    description : toValue(item.data.description) || '',
                    url         : item.data.url,
                    tags        : item.data.tags,
                    note        : '',
                    metadata    : {
                        path    : getAncestors(item),
                        hostname: hostnameFromUrl(item.data.url),
                    }
                })

            } else {
                // TODO: maybe optimize this by addind children of type
                // bookmark to results immediately and only push folders to
                // the stack.
                stack.push(...item.children)
            }
        }

        return Ok(results)
    }

    ////////////////////////////////////////////////////////////////////////////
}

// Helper Functions ////////////////////////////////////////////////////////////

/**
 * Function returns the ancestors of a folder/bookmark in correct order.
 */
function getAncestors(item: Folder | Bookmark): string[] {
    const path = [ toValue(item.data.title) || '' ]
    let curr = item
    while (curr.parent.some) {
        path.push( toValue(curr.parent.val.data.title) || '' )
        curr = curr.parent.val
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
