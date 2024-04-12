// Imports /////////////////////////////////////////////////////////////////////
import ky, { HTTPError } from 'ky'
import { Result, Ok, Err } from 'ts-results'
import { Report } from 'error-report'
import { BASE_URL } from '.'
import { ICollection, SCollection, responseSchema } from './schemas'

// API Request /////////////////////////////////////////////////////////////////
/**
 * Get the root collections.
 */
export async function getRootCollections(
    authToken: string
): Promise<Result<ICollection[], Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.get(
        'collections',
        {
            prefixUrl: BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` }
        }
    ))

    if (res.err) {
        // Get response body
        const rb = JSON.stringify(await (res.val as HTTPError).response.json())

        return Err(Report.from(res.val).add(new GetRootCollectionsError(rb)))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new GetRootCollectionsError()))
    }

    // Validate and parse response
    const resData = responseSchema(SCollection).safeParse(json.val)
    if (!resData.success) {
        return Err(Report.from(resData.error).add(new GetRootCollectionsError()))
    }

    // Return
    return Ok(resData.data.items)
}


// Error ///////////////////////////////////////////////////////////////////////
export class GetRootCollectionsError extends Error {
    constructor(e?: unknown) {
        if (e) {
            super(`failed to get root collections: ${e}`)

        } else {
            super('failed to get root collections')
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
