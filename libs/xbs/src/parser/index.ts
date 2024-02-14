// Imports /////////////////////////////////////////////////////////////////////
import { Err, Ok, Result, Option } from 'ts-results'
import { ZodError, z } from 'zod'
import { toOption } from 'ts-results-utils'

// Schemata and Interfaces /////////////////////////////////////////////////////

/**
 * {@link SBookmark} is the data schema of the xBrowserSync bookmarks.
 * {@link IBookmark} is the corresponding interface.
 */
const SBookmark = z.object({
    id          : z.number(),
    title       : z.string().optional(),
    description : z.string().optional(),
    url         : z.string(),
    tags        : z.array(z.string()).optional(),
})

export type IBookmark = z.infer<typeof SBookmark>


/**
 * {@link SFolderBase} and {@link SFolder} define the data scheme of a
 * xBrowserSync folder. Because of their recursiveness they need to be defined
 * as two separate schemas.
 * {@link IFolder} is the corresponding interface.
 */
const SFolderBase = z.object({
    id          : z.number(),
    title       : z.string().optional(),
})

const SFolder: z.ZodType<IFolder> = SFolderBase.extend({
    // Usually children is not `undefined`. But just to make sure parsing will
    // work we use `.optional()` and default to `[]` on transformation.
    children    : z.lazy(() => SBookmark.or(SFolder).array()).optional()
})

export type IFolder = z.infer<typeof SFolderBase> & {
    children?   : (IFolder | IBookmark)[]
}


// Data Transformation /////////////////////////////////////////////////////////
export interface ExtIBookmark {
    type        : 'bookmark'
    id          : number
    title       : Option<string>
    description : Option<string>
    url         : string
    tags        : string[]
}

export interface ExtIFolder {
    type        : 'folder'
    id          : number
    title       : Option<string>
    children    : (ExtIBookmark | ExtIFolder)[]
}

/**
 * This function recursively transforms
 * {@link IBookmark}    to {@link ExtIBookmark} and
 * {@link IFolder}      to {@link ExtIFolder}.
 */
function transformation(
    input: (IFolder | IBookmark)[]
): (ExtIBookmark | ExtIFolder)[] {
    return input.map(i => {
        // Type-guard
        const item = i as (IFolder & IBookmark)

        // Case: `item` is bookmark
        if (item.url) {
            const { title, description, tags, ...rest } = item as IBookmark
            return {
                type: 'bookmark',
                title: toOption(title),
                description: toOption(description),
                tags: tags || [],
                ...rest
            }
        }

        // Case: `item` is folder
        else {
            const { title, children, ...rest } = item as IFolder
            return {
                type: 'folder',
                title: toOption(title),
                children: children ? transformation(children) : [],
                ...rest
            }
        }
    })
}


// Parse Function //////////////////////////////////////////////////////////////
/**
 * The root schema
 */
const SXbsData = SBookmark.or(SFolder).array().transform(transformation)
export type IXbsData = z.infer<typeof SXbsData>

/**
 * Parse and transform.
 */
export function parse(data: unknown): Result<IXbsData, ZodError> {
    // Parse
    const result = SXbsData.safeParse(data)
    if (!result.success) {
        return Err(result.error)
    }

    // Return
    return Ok(result.data)
}

////////////////////////////////////////////////////////////////////////////////
