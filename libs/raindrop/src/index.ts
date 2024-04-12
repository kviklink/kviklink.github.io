// Re-Exports //////////////////////////////////////////////////////////////////
export { RaindropBuilder } from './builder'

// Imports /////////////////////////////////////////////////////////////////////
import { Err, Ok, Result } from 'ts-results'
import { getAllRaindrops, getChildCollections, getRootCollections, getUserStats, IRaindropPostData, postRaindrop } from './api'
import { ICollection, IRaindrop, IRaindropPost, IRaindropPut, IUserStats } from './api/schemas'
import { IRaindropPutData, putRaindrop } from './api/putRaindrop'

// Class ///////////////////////////////////////////////////////////////////////

/**
 * TODO: add documentation.
 */
export class RaindropClient {
    // Attributes //////////////////////////////////////////////////////////////
    public readonly token: string

    // Constructor /////////////////////////////////////////////////////////////
    constructor(token: string) { this.token = token }

    // Public Methods //////////////////////////////////////////////////////////

    /**
     * Get all raindrops from the API.
     */
    public async getAllRaindrops(): Promise<Result<IRaindrop[], string>> {
        // Get data from API
        const res = await getAllRaindrops(this.token)
        if (res.err) { return Err(res.val.toString()) }

        // Return
        return Ok(res.val)
    }

    /**
     * Get root collections.
     */
    public async getRootCollections(): Promise<Result<ICollection[], string>> {
        // Get data from API
        const res = await getRootCollections(this.token)
        if (res.err) { return Err(res.val.toString() )}

        // Return
        return Ok(res.val)
    }

    /**
     * Get child collections
     */
    public async getChildCollections(): Promise<Result<ICollection[], string>> {
        // Get data from API
        const res = await getChildCollections(this.token)
        if (res.err) { return Err(res.val.toString() )}

        // Return
        return Ok(res.val)
    }

    /**
     * Get all collections. This is just a convenience function which fetches
     * the root and child collections and returns them togehter.
     */
    public async getAllCollections(): Promise<Result<ICollection[], string>> {
        // Get data from API
        const res = await Result.wrapAsync(() => Promise.all([
            this.getRootCollections(),
            this.getChildCollections()
        ]))

        if (res.err) { return Err('request failed') }

        const rootRes = res.val[0]
        const childRes = res.val[1]

        if (rootRes.err) { return Err(rootRes.val) }
        if (childRes.err) { return Err(childRes.val) }

        // Return
        return Ok([ ...rootRes.val, ...childRes.val ])
    }

    /**
     * Get user stats.
     */
    public async getUserStats(): Promise<Result<IUserStats, string>> {
        // Get data from API
        const res = await getUserStats(this.token)
        if (res.err) { return Err(res.val.toString() ) }

        // Return
        return Ok(res.val)
    }

    /**
     * Post (create) raindrop.
     */
    public async postRaindrop(
        data: IRaindropPostData
    ): Promise<Result<IRaindropPost, string>> {
        // Post data to API
        const res = await postRaindrop(this.token, data)
        if (res.err) { return Err(res.val.toString()) }

        // Return
        return Ok(res.val)
    }

    /**
     * Post (create) raindrop.
     */
    public async putRaindrop(
        id: number,
        data: IRaindropPutData,
    ): Promise<Result<IRaindropPut, string>> {
        // Post data to API
        const res = await putRaindrop(this.token, id, data)
        if (res.err) { return Err(res.val.toString()) }

        // Return
        return Ok(res.val)
    }

    ////////////////////////////////////////////////////////////////////////////
}

////////////////////////////////////////////////////////////////////////////////
