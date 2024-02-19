// Imports /////////////////////////////////////////////////////////////////////
import { z } from 'zod'

// Schema //////////////////////////////////////////////////////////////////////
export const RAINDROP_TYPES = [
    'link', 'article', 'image', 'video', 'document', 'audio'
] as const
export const SRaindropType = z.enum(RAINDROP_TYPES)
export type RaindropType = z.infer<typeof SRaindropType>

/**
 * Represents a raindrop from the API.
 */
export const SRaindrop = z.object({
    _id         : z.number(),
    link        : z.string(),
    title       : z.string(),
    excerpt     : z.string(),
    note        : z.string(),
    type        : SRaindropType,
    tags        : z.array(z.string()),
    collection  : z.object({
        $id     : z.number(),
    })
})

export type IRaindrop = z.infer<typeof SRaindrop>

////////////////////////////////////////////////////////////////////////////////
