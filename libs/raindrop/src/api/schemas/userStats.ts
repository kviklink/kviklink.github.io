// Imports /////////////////////////////////////////////////////////////////////
import { z } from 'zod'

// Schema //////////////////////////////////////////////////////////////////////
/**
 * Represents a raindrop from the API.
 */
export const SUserStats = z.object({
    result: z.boolean(),
    items: z.array(z.object({
        _id     : z.number(),
        count   : z.number(),
    })),
    meta: z.object({
        _id                 : z.number(),
        changedBookmarksDate: z.string().datetime(),
        pro                 : z.boolean(),
    })
})

export type IUserStats = z.infer<typeof SUserStats>

////////////////////////////////////////////////////////////////////////////////
