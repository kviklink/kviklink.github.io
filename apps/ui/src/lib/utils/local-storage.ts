// Imports /////////////////////////////////////////////////////////////////////
import { Result, Ok, Err } from 'ts-results'
import { z } from 'zod'

// Functions ///////////////////////////////////////////////////////////////////
function read<T>(key: string, schema: z.ZodType<T>): Result<T, string> {
    // Read data
    const data = window.localStorage.getItem(key)
    if (!data) { return Err('no data') }

    // Parse as JSON
    const parsed = Result.wrap(() => JSON.parse(data))
    if (parsed.err) { return Err('invalid data') }

    // Validate
    const val = schema.safeParse(parsed.val)
    if (!val.success) { return Err('data validation failed') }

    // Return
    return Ok(val.data)
}

function write<T>(key: string, data: T): Result<null, string> {
    // Stringify data
    const str = Result.wrap(() => JSON.stringify(data))
    if (str.err) { return Err('invalid data') }

    // Write data
    window.localStorage.setItem(key, str.val)

    // Return
    return Ok(null)
}

// Exports /////////////////////////////////////////////////////////////////////
export default { read, write }

////////////////////////////////////////////////////////////////////////////////
