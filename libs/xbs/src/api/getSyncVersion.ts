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
export async function getSyncVersion(
    baseUrl: string,
    syncId: string,
): Promise<Result<GetBookmarksVersionRes, Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.get(
        `bookmarks/${syncId}/version`,
        { prefixUrl: baseUrl }
    ))

    if (res.err) {
        return Err(Report.from(res.val).add(new GetVersionError()))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new GetVersionError()))
    }

    // Validate and parse response
    const resData = GetBookmarksVersionResSchema.safeParse(json.val)

    if (!resData.success) {
        return Err(Report.from(resData.error).add(new GetVersionError()))
    }

    // Return
    return Ok(resData.data)
}

// Schema //////////////////////////////////////////////////////////////////////
/**
 * Result data from getting bookmarks.
 */
const GetBookmarksVersionResSchema = z.object({
    // Version number of the xBrowserSync client used to create the sync
    version : z.string(),
})

export type GetBookmarksVersionRes = z
    .infer<typeof GetBookmarksVersionResSchema>

// Error ///////////////////////////////////////////////////////////////////////
export class GetVersionError extends Error {
    constructor() { super('failed to get sync version') }
}

////////////////////////////////////////////////////////////////////////////////
