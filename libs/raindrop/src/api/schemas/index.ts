// Re-Exports //////////////////////////////////////////////////////////////////
export * from './raindrop'
export * from './collection'
export * from './userStats'

// Imports /////////////////////////////////////////////////////////////////////
import { z } from 'zod'

// Helper Functions (for schemas) //////////////////////////////////////////////
/**
 * Returns the schema of a Raindrop.io API response with the given schema as
 * generic type.
 */
export function responseSchema<T>(t: z.ZodType<T>) {
    return z.object({ items: z.array(t), count: z.number().optional() })
}

////////////////////////////////////////////////////////////////////////////////
