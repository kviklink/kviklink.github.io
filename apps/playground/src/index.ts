// Imports /////////////////////////////////////////////////////////////////////
import Fuse from 'fuse.js'
import { inspect } from 'util'
import { Option, Some, None } from 'ts-results'

// Main ////////////////////////////////////////////////////////////////////////
interface IBookmark {
    id: number,
    title: string | undefined,
    description: string
    url: string
    tags: string[]
}

interface IFolder {
    id: number,
    title: string,
    children: (IFolder | IBookmark)[],
}

const data: (IFolder | IBookmark)[] = [
    {
        id: 1,
        title: '',
        description: '',
        url: 'https://google.com',
        tags: [ 'search' ]
    },
    {
        id: 2,
        title: 'DuckDuckGo',
        description: '',
        url: 'https://duckduckgo.com/',
        tags: [ 'search' ]
    },
    {
        id: 3,
        title: 'Startpage',
        description: '',
        url: 'https://www.startpage.com/de/',
        tags: [ 'search' ]
    },
    {
        id: 4,
        title: 'HJG',
        description: 'Herzog Johann Gymnasium',
        url: 'https://hjg-sim.de',
        tags: [ 'school', 'asdf' ]
    }
]


interface Item {
    id: number,
    parents?: number[],
    children: Item[]
}

const items: Item[] = [
    {
        id: 1,
        children: []
    },
    {
        id: 2,
        children: [
            {
                id: 21,
                children: []
            },
            {
                id: 22,
                children: [
                    {
                        id: 221,
                        children: []
                    },
                    {
                        id: 222,
                        children: []
                    },
                    {
                        id: 223,
                        children: []
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        children: [
            {
                id: 31,
                children: [
                    {
                        id: 311,
                        children: []
                    }
                ]
            }
        ]
    },
    {
        id: 4,
        children: [
            {
                id: 41,
                children: []
            },
            {
                id: 42,
                children: []
            }
        ]
    },
]


async function main() {


    // const fuse = new Fuse(data, {
    //     includeScore: true,
    //     keys: ['title', 'description', 'tags', 'url']
    // })

    // console.log(inspect(fuse.search(''), false, null, true))


    const stack: Item[] = items.reverse()
    console.log(stack)

    const result: Item[] = []

    while (stack.length > 0) {
        // Get item from stack
        const item = stack.pop()!

        // Add item to results
        result.push({ id: item.id, children: [], parents: item.parents })

        // Inject "parent"-information into children
        item.children.map(c => c.parents = [...(item.parents || []), item.id])

        // Add children to stack
        stack.push(...item.children.reverse())

    }

    console.log(
        result.map(x => `${ [...(x.parents || []), (x.id)].join('/')}`)
    )
}

////////////////////////////////////////////////////////////////////////////////
main();
////////////////////////////////////////////////////////////////////////////////
