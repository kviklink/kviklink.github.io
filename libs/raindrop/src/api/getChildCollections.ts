// Imports /////////////////////////////////////////////////////////////////////
import ky from 'ky'
import { Result, Ok, Err } from 'ts-results'
import { Report } from 'error-report'
import { BASE_URL } from '.'
import { ICollection, SCollection, responseSchema } from './schemas'

// API Request /////////////////////////////////////////////////////////////////
/**
 * Get all collections that are not root collections (at any depth/level).
 */
export async function getChildCollections(
    authToken: string
): Promise<Result<ICollection[], Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.get(
        'collections/childrens',
        {
            prefixUrl: BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` }
        }
    ))

    if (res.err) {
        return Err(Report.from(res.val).add(new GetChildCollectionsError()))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new GetChildCollectionsError()))
    }

    // Validate and parse response
    const resData = responseSchema(SCollection).safeParse(json.val)
    if (!resData.success) {
        return Err(Report.from(resData.error).add(new GetChildCollectionsError()))
    }

    // Return
    return Ok(resData.data.items)
}


// Error ///////////////////////////////////////////////////////////////////////
export class GetChildCollectionsError extends Error {
    constructor() { super('failed to get child collections') }
}

////////////////////////////////////////////////////////////////////////////////
