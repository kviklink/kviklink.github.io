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
}).strict()

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
}).strict()

const SFolder: z.ZodType<IFolder> = SFolderBase.extend({
    // Usually children is not `undefined`. But just to make sure parsing will
    // work we use `.optional()` and default to `[]` on transformation.
    children    : z.lazy(() => SBookmark.or(SFolder).array())
}).strict()

export type IFolder = z.infer<typeof SFolderBase> & {
    children    : (IFolder | IBookmark)[]
}


// Data Transformation /////////////////////////////////////////////////////////
export interface ExtIBookmark {
    readonly type        : 'bookmark'
    readonly id          : number
    readonly title       : Option<string>
    readonly description : Option<string>
    readonly url         : string
    readonly tags        : string[]
}

export interface ExtIFolder {
    readonly type        : 'folder'
    readonly id          : number
    readonly title       : Option<string>
    readonly children    : (ExtIBookmark | ExtIFolder)[]
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
        if (item.url !== undefined) {
            return transformBookmark(item as IBookmark)
        }

        // Case: `item` is folder
        else {
            return transformFolder(item as IFolder)
        }
    })
}

export function transformBookmark(item: IBookmark): ExtIBookmark {
    const { title, description, tags, ...rest } = item as IBookmark
    return {
        type: 'bookmark',
        title: toOption(title),
        description: toOption(description),
        tags: tags || [],
        ...rest
    }
}

export function transformFolder(item: IFolder): ExtIFolder {
    const { title, children, ...rest } = item as IFolder
    return {
        type: 'folder',
        title: toOption(title),
        children: children ? transformation(children) : [],
        ...rest
    }
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
