// Imports /////////////////////////////////////////////////////////////////////
import ky from 'ky'
import { Result, Ok, Err } from 'ts-results'
import { Report } from 'error-report'
import { BASE_URL } from '.'
import { IUserStats, SUserStats } from './schemas'

// API Request /////////////////////////////////////////////////////////////////
/**
 * Fetches all raindrops from the API.
 */
export async function getUserStats(
    authToken: string
): Promise<Result<IUserStats, Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.get(
        'user/stats',
        {
            prefixUrl: BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` }
        }
    ))

    if (res.err) {
        return Err(Report.from(res.val).add(new GetUserStatsError()))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new GetUserStatsError()))
    }

    // Validate and parse response
    const resData = SUserStats.safeParse(json.val)
    if (!resData.success) {
        return Err(Report.from(resData.error).add(new GetUserStatsError()))
    }

    // Return
    return Ok(resData.data)
}


// Error ///////////////////////////////////////////////////////////////////////
export class GetUserStatsError extends Error {
    constructor() { super('failed to get user stats') }
}

////////////////////////////////////////////////////////////////////////////////
