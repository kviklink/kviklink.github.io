// Imports /////////////////////////////////////////////////////////////////////
import ky, { HTTPError } from 'ky'
import { Result, Ok, Err } from 'ts-results'
import { Report } from 'error-report'
import { BASE_URL } from '.'
import { IRaindrop, IRaindropPut, SRaindropPut } from './schemas'

// Types ///////////////////////////////////////////////////////////////////////
export type IRaindropPutData = Partial<Omit<IRaindrop, 'link' | '_id'>>

// API Request /////////////////////////////////////////////////////////////////
/**
 * Put (update) a raindrop.
 */
export async function putRaindrop(
    authToken: string,
    id: number,
    raindrop: IRaindropPutData,
): Promise<Result<IRaindropPut, Report>> {
    // Make request
    const res = await Result.wrapAsync(() => ky.put(
        `raindrop/${id}`,
        {
            prefixUrl: BASE_URL,
            headers: { 'Authorization': `Bearer ${authToken}` },
            json: raindrop,
        }
    ))

    if (res.err) {
        // Get response body
        const rb = JSON.stringify(await (res.val as HTTPError).response.json())

        return Err(Report.from(res.val).add(new PutRaindropError(rb)))
    }

    // Get JSON response
    const json = await Result.wrapAsync(() => res.val.json())

    if (json.err) {
        return Err(Report.from(json.val).add(new PutRaindropError()))
    }

    // Validate and parse response
    const resData = SRaindropPut.safeParse(json.val)
    if (!resData.success) {
        return Err(Report.from(resData.error).add(new PutRaindropError()))
    }

    // Return
    return Ok(resData.data)
}


// Error ///////////////////////////////////////////////////////////////////////
export class PutRaindropError extends Error {
    constructor(e?: unknown) {
        if (e) {
            super(`failed to put raindrop: ${e}`)

        } else {
            super('failed to put raindrop')
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
