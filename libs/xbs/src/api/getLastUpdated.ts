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
export async function getLastUpdated(
    baseUrl: string,
    syncId: string,
): Promise<Result<GetBookmarksLastUpdatedRes, Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.get(
        `bookmarks/${syncId}/lastUpdated`,
        { prefixUrl: baseUrl }
    ))

    if (res.err) {
        return Err(Report.from(res.val).add(new GetLastUpdatedError()))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new GetLastUpdatedError()))
    }

    // Validate and parse response
    const resData = GetBookmarksLastUpdatedResSchema.safeParse(json.val)

    if (!resData.success) {
        return Err(Report.from(resData.error).add(new GetLastUpdatedError()))
    }

    // Return
    return Ok(resData.data)
}

// Schema //////////////////////////////////////////////////////////////////////
/**
 * Result data from getting bookmarks.
 */
const GetBookmarksLastUpdatedResSchema = z.object({
    // Last updated timestamp for retrieved bookmarks.
    lastUpdated : z.string().datetime(),
})

export type GetBookmarksLastUpdatedRes = z
    .infer<typeof GetBookmarksLastUpdatedResSchema>

// Error ///////////////////////////////////////////////////////////////////////
export class GetLastUpdatedError extends Error {
    constructor() { super('failed to get last updated timestamp') }
}

////////////////////////////////////////////////////////////////////////////////
