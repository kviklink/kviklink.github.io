// Imports /////////////////////////////////////////////////////////////////////
import ky from 'ky'
import { Result, Ok, Err } from 'ts-results'
import { Report } from 'error-report'
import { BASE_URL } from '.'
import { IRaindrop, SRaindrop, responseSchema } from './schemas'

// API Request /////////////////////////////////////////////////////////////////
/**
 * Fetches all raindrops from the API.
 */
export async function getAllRaindrops(
    authToken: string
): Promise<Result<IRaindrop[], Report>> {
    // Request first page
    const page0 = await requestPage(authToken, 0)
    if (page0.err) {
        return Err(Report.from(page0.val).add(new GetAllRaindropsError()))
    }

    // Get count and calculate page count
    const count = page0.val.count
    if (count === undefined) { return Ok(page0.val.raindrops) }

    const pages = Math.ceil(count / 50)

    // Create requests for other pages
    const pageRequests: Promise<
        Result<{ raindrops: IRaindrop[], count?: number }, Report>
    >[] = []

    for (let i = 1; i < pages; i++) {
        pageRequests.push(requestPage(authToken, i))
    }

    // Await all requests
    const results = await Result.wrapAsync(() => Promise.all(pageRequests))
    if (results.err) { return Err(Report.from(new GetAllRaindropsError()))}

    // Collect results
    const allRaindrops = page0.val.raindrops
    for (const res of results) {
        if (res.err) {
            return Err(Report.from(res.val).add(new GetAllRaindropsError()))
        }

        allRaindrops.push(...res.val.raindrops)
    }

    // Return
    return Ok(allRaindrops)
}

async function requestPage(
    authToken: string, page: number
): Promise<Result<{ raindrops: IRaindrop[], count?: number }, Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.get(
        'raindrops/0',
        {
            prefixUrl: BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` },
            searchParams: { page, perpage: 50 }
        }
    ))

    if (res.err) {
        return Err(Report.from(res.val).add(new GetAllRaindropsError()))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new GetAllRaindropsError()))
    }

    // Validate and parse response
    const resData = responseSchema(SRaindrop).safeParse(json.val)
    if (!resData.success) {
        return Err(Report.from(resData.error).add(new GetAllRaindropsError()))
    }

    // Return
    return Ok({ raindrops: resData.data.items, count: resData.data.count } )
}



// Error ///////////////////////////////////////////////////////////////////////
export class GetAllRaindropsError extends Error {
    constructor() { super('failed to get all raindrops') }
}

////////////////////////////////////////////////////////////////////////////////
