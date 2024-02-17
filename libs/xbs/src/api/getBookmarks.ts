// Imports /////////////////////////////////////////////////////////////////////
import ky from 'ky'
import { Result, Ok, Err } from 'ts-results'
import { Report } from 'error-report'
import { z } from 'zod'

// API Request /////////////////////////////////////////////////////////////////
/**
 * Retrieves the bookmark sync corresponding to the provided sync ID.
 * @param baseUrl base URL of the xBrowserSync service
 * @param syncId 32 character alphanumeric sync ID
 */
export async function getBookmarks(
    baseUrl: string,
    syncId: string,
): Promise<Result<GetBookmarksRes, Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.get(
        `bookmarks/${syncId}`,
        { prefixUrl: baseUrl }
    ))

    if (res.err) {
        return Err(Report.from(res.val).add(new GetBookmarksError()))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new GetBookmarksError()))
    }

    // Validate and parse response
    const resData = GetBookmarksResSchema.safeParse(json.val)
    if (!resData.success) {
        return Err(Report.from(resData.error).add(new GetBookmarksError()))
    }

    // Return
    return Ok(resData.data)
}


// Schema //////////////////////////////////////////////////////////////////////
/**
 * Result data from getting bookmarks.
 */
const GetBookmarksResSchema = z.object({
    // Encrypted bookmark data salted using secret value.
    bookmarks   : z.string(),

    // Last updated timestamp for retrieved bookmarks.
    lastUpdated : z.string().datetime(),

    // Version number of the xBrowserSync client used to create the sync
    version     : z.string()
})

export type GetBookmarksRes = z.infer<typeof GetBookmarksResSchema>


// Error ///////////////////////////////////////////////////////////////////////
export class GetBookmarksError extends Error {
    constructor() { super('failed to get bookmarks') }
}

////////////////////////////////////////////////////////////////////////////////
