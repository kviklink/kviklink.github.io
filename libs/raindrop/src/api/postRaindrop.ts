// Imports /////////////////////////////////////////////////////////////////////
import ky, { HTTPError } from 'ky'
import { Result, Ok, Err } from 'ts-results'
import { Report } from 'error-report'
import { BASE_URL } from '.'
import { IRaindrop, IRaindropPost, SRaindropPost } from './schemas'

// Types ///////////////////////////////////////////////////////////////////////
export type IRaindropPostData = Partial<Omit<IRaindrop, 'link' | '_id'>> & {
    link: string,
    domain: string,
}

// API Request /////////////////////////////////////////////////////////////////
/**
 * Post (create) a new raindrop.
 */
export async function postRaindrop(
    authToken: string,
    raindrop: IRaindropPostData,
): Promise<Result<IRaindropPost, Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.post(
        'raindrop',
        {
            prefixUrl: BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` },
            json: raindrop,
        }
    ))

    if (res.err) {
        // Get response body
        const rb = JSON.stringify(await (res.val as HTTPError).response.json())

        return Err(Report.from(res.val).add(new PostRaindropError(rb)))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new PostRaindropError()))
    }

    // Validate and parse response
    const resData = SRaindropPost.safeParse(json.val)
    if (!resData.success) {
        return Err(Report.from(resData.error).add(new PostRaindropError()))
    }

    // Return
    return Ok(resData.data)
}


// Error ///////////////////////////////////////////////////////////////////////
export class PostRaindropError extends Error {
    constructor(e?: unknown) {
        if (e) {
            super(`failed to post raindrop: ${e}`)

        } else {
            super('failed to post raindrop')
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
