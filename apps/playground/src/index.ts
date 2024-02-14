// Imports /////////////////////////////////////////////////////////////////////
import { inspect } from 'util'
import { z, ZodError } from 'zod'
import { Result, Ok, Err, Option, Some, None} from 'ts-results'
import { toOption } from 'ts-results-utils'

// Main ////////////////////////////////////////////////////////////////////////
const raw = [
    {
        title: '[xbs] Other',
        id: 1,
        children: [
            {
                title: 'Google',
                url: 'https://www.google.de',
                id: 2,
                tags: [
                    'asdf'
                ]
            },
            {
                id: 100,
                title: 'Test 1',
                children: [
                    {
                        id: 101,
                        title: 'asdf',
                        url: 'https://hjg-sim.de',
                        tags: [ 'schule', 'HJG' ]
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        title: 'Test',
        description: 'Hello World',
        url: 'https://duckduckgo.org',
        tags: [ 'asdf' ]
    },
    {
        id: 4,
        title: 'Test',
        description: 'Hello World',
        url: 'https://duckduckgo.org'
    },
    {
        id: 5,
        title: 'Test',
        description: 'Hello World',
        url: 'https://duckduckgo.org'
    }
]

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
    children    : z.lazy(() => SBookmark.or(SFolder).array()).optional()
})

export type IFolder = z.infer<typeof SFolderBase> & {
    children?   : (IFolder | IBookmark)[]
}


// Data Transformation /////////////////////////////////////////////////////////
interface ExtIBookmark {
    type        : 'bookmark'
    id          : number
    title       : Option<string>
    description : Option<string>
    url         : string
    tags        : string[]
}

interface ExtIFolder {
    type        : 'folder'
    id          : number
    title       : Option<String>
    children    : (ExtIBookmark | ExtIFolder)[]
}


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
                ...rest,
                children: children ? transformation(children) : []
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



async function main() {
    const res = parse(raw)
    console.log(inspect(res, true, null, true))
}

////////////////////////////////////////////////////////////////////////////////
main();
////////////////////////////////////////////////////////////////////////////////
