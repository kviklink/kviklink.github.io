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
export interface XIBookmark {
    readonly _type       : 'bookmark'
    readonly id          : number
    readonly title       : Option<string>
    readonly description : Option<string>
    readonly url         : string
    readonly tags        : string[]
}

export interface XIFolder {
    readonly _type       : 'folder'
    readonly id          : number
    readonly title       : Option<string>
    readonly children    : (XIBookmark | XIFolder)[]
}

/**
 * This function recursively transforms
 * {@link IBookmark}    to {@link XIBookmark} and
 * {@link IFolder}      to {@link XIFolder}.
 */
function transformation(
    input: (IFolder | IBookmark)[]
): (XIBookmark | XIFolder)[] {
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

/**
 * Transform a raw bookmark into the extended bookmark interface with safe types
 */
export function transformBookmark(item: IBookmark): XIBookmark {
    const { title, description, tags, ...rest } = item as IBookmark
    return {
        _type: 'bookmark',
        title: toOption(title),
        description: toOption(description),
        tags: tags || [],
        ...rest
    }
}

/**
 * Transform a raw folder into the extended folder interface with safe types
 */
export function transformFolder(item: IFolder): XIFolder {
    const { title, children, ...rest } = item as IFolder
    return {
        _type: 'folder',
        title: toOption(title),
        children: children ? transformation(children) : [],
        ...rest
    }
}


// Parse Function //////////////////////////////////////////////////////////////
/**
 * The root schema (DataTree ???)
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
