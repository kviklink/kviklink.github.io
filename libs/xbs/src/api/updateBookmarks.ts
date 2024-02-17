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
 * @param data new bookmark data
 */
export async function updateBookmarks(
    baseUrl: string,
    syncId: string,
    data: UpdateBookmarksReq,
): Promise<Result<UpdateBookmarksRes, Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.put(
        `bookmarks/${syncId}`,
        { prefixUrl: baseUrl, json: data }
    ))

    if (res.err) {
        return Err(Report.from(res.val).add(new UpdateBookmarksError()))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new UpdateBookmarksError()))
    }

    // Validate and parse response
    const resData = UpdateBookmarksResSchema.safeParse(json.val)

    if (!resData.success) {
        return Err(Report.from(resData.error).add(new UpdateBookmarksError()))
    }

    // Return
    return Ok(resData.data)
}


// Schema //////////////////////////////////////////////////////////////////////
/**
 * Request data for updating bookmarks.
 */
export interface UpdateBookmarksReq {
    // Encrypted bookmark data salted using secred value.
    bookmarks   : string,

    // Last updated timestamp to check against existing bookmarks.
    lastUpdated : string
}

/**
 * Result data from updating bookmarks.
 */
const UpdateBookmarksResSchema = z.object({
    // Last updated timestamp for updated bookmarks.
    lastUpdated : z.string().datetime(),
})

export type UpdateBookmarksRes = z.infer<typeof UpdateBookmarksResSchema>


// Error ///////////////////////////////////////////////////////////////////////
export class UpdateBookmarksError extends Error {
    constructor() { super('failed to update bookmarks') }
}

////////////////////////////////////////////////////////////////////////////////
