// Import //////////////////////////////////////////////////////////////////////
import { Result, Ok, Err, Option, None, Some } from 'ts-results'
import type { IBookmark, IBackend, IBackendBuilder } from '.'
import { z } from 'zod'
import { hostnameFromUrl } from '../utils/hostname'
import { RaindropBuilder, RaindropClient } from 'raindrop'
import type { ICollection, IRaindrop } from 'raindrop/src/api/schemas'
import { toOption } from 'ts-results-utils'

// Constants ///////////////////////////////////////////////////////////////////
const CACHE_THRESHOLD = 10_000 // 10 seconds (because of raindrop rate limit)

// Builder /////////////////////////////////////////////////////////////////////
export const RaindropBackendBuilder: IBackendBuilder = {
    /**
     * In case of Raindrop.io "login" means that
     *  -   the provided token is used to create a Raindrop API client
     *  -   request to the server is made to make sure the token is correct
     *
     * @param credentials as `{ token: string }`
     * @returns {Result<IBackend, string>}
     */
    login: async (credentials: Record<string, unknown>): Promise<Result<IBackend, string>> => {
        // Validate and parse credentials
        const schema = z.object({ token: z.string().min(1) }).strict();

        const parsed = schema.safeParse(credentials)
        if (!parsed.success) { return Err(parsed.error.toString()) }

        // Create Xbs client with XbsBuilder (using plaintext credentials)
        const rdc = new RaindropBuilder()
            .setTestToken(parsed.data.token)
            .finish()

        if (rdc.err) { return Err(rdc.val) }

        // Execute user stats to make sure everything works
        const res = await rdc.val.getUserStats()
        if (res.err) { return Err(res.val) }

        // Return Xbs backend
        return Ok(new RaindropBackend(rdc.val))
    },

    /**
     * In case of Raindrop.io "login" and "auth" do the same thing because,
     * the simplified authentication process is used, where the user provides
     * his own token (called "test token").
     */
    auth: async (credentials: Record<string, unknown>): Promise<Result<IBackend, string>> => {
        return RaindropBackendBuilder.login(credentials)
    },
}

// Backend /////////////////////////////////////////////////////////////////////
export class RaindropBackend implements IBackend {
    // Attributes //////////////////////////////////////////////////////////////
    private rdc: RaindropClient

    // Cache
    private cache: Option<{
        collectionIndex: Map<number, ICollection>,
        raindrops: IRaindrop[],
    }>

    // Stores the timestamp of when data was last fetched from the backend.
    // This can be used to prevent re-fetching multiple times in a very short
    // period of time.
    // Unix timestamp in milliseconds (`Date.now()`).
    private cacheAge: number = 0

    // Constructor /////////////////////////////////////////////////////////////
    public constructor(rdc: RaindropClient) {
        this.rdc = rdc; this.cache = None
    }

    // IBookmark Methods ///////////////////////////////////////////////////////
    canRead(): true { return true }
    canManage(): boolean { return false }
    canStoreConfig(): boolean { return false }
    getCredentials(): Record<string, unknown> {
        return { token: this.rdc.token }
    }

    // Private Methods /////////////////////////////////////////////////////////
    private async loadFromCacheOrApi(force?: boolean): Promise<Result<{
        collectionIndex: Map<number, ICollection>,
        raindrops: IRaindrop[],
    }, string>> {
        // If force is false: try to use cache
        if (
            force === false &&
            this.cache.some &&                              // cache set?
            (Date.now() - this.cacheAge) < CACHE_THRESHOLD  // cache valid?
        ) {
            return Ok(this.cache.val)

        } else {
            // Get data from API
            const results = await Result.wrapAsync(() => Promise.all([
                this.rdc.getAllCollections(),
                this.rdc.getAllRaindrops()
            ]))
            if (results.err) { return Err('requests to API failed') }

            console.log(await this.rdc.getAllRaindrops())

            const collections = results.val[0]
            const raindrops = results.val[1]

            if (collections.err) { return Err(collections.val) }
            if (raindrops.err) { return Err(raindrops.val) }

            // Create Index
            const collectionIndex = new Map(
                collections.val.map(c => [c._id, c])
            )

            // Construct result data
            const result = { collectionIndex, raindrops: raindrops.val }

            // Set cache
            this.cache = Some(result)

            // Return
            return Ok(result)
        }
    }

    private getAncestors(
        parentId: number, collectionIndex: Map<number, ICollection>
    ): string[] {
        // Start with empty path because the current folder/bookmark title
        // should not be included.
        const path: string[] = []

        // Pointer to the current item's parent
        let parent = collectionIndex.get(parentId)

        // While the current item has a parent, add the parent's title to the
        // path.
        while (parent) {
            path.push(parent.title)

            // Move pointer to parent's parent
            if (parent.parent) {
                parent = collectionIndex.get(parent.parent.$id)

            } else {
                break
            }
        }

        return path
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
        const bookmarks = data.val.raindrops
        console.log(data.val.collectionIndex.values())

        // Transform and return
        return Ok(bookmarks.map(item => { return {
            id          : item._id,
            title       : item.title,
            description : item.excerpt,
            url         : item.link,
            tags        : item.tags,
            note        : item.note,
            metadata    : {
                path    : this.getAncestors(
                    item.collection.$id, data.val.collectionIndex
                ),
                hostname: hostnameFromUrl(item.link),
            }
        }}))
    }

    async findBookmarkById(id: number): Promise<Result<Option<IBookmark>, string>> {
        // Get data
        const data = await this.loadFromCacheOrApi()
        if (data.err) { return Err(data.val) }

        // Perform search
        const bookmark = toOption(data.val.raindrops.find(x => x._id === id))

        // Transform and return
        return Ok(bookmark.map(item => { return {
            id          : item._id,
            title       : item.title,
            description : item.excerpt,
            url         : item.link,
            tags        : item.tags,
            note        : item.note,
            metadata    : {
                path    : this.getAncestors(
                    item.collection.$id, data.val.collectionIndex
                ),
                hostname: hostnameFromUrl(item.link),
            }
        }}))
    }

    ////////////////////////////////////////////////////////////////////////////
}

////////////////////////////////////////////////////////////////////////////////
