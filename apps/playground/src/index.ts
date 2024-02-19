// Imports /////////////////////////////////////////////////////////////////////
import Fuse from 'fuse.js'
import { inspect } from 'util'
import { Option, Some, None } from 'ts-results'
import { XbsBuilder } from 'xbs'

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
    // Search Test /////////////////////////////////////////////////////////////
    // const fuse = new Fuse(data, {
    //     includeScore: true,
    //     includeMatches: true,
    //     keys: ['title', 'description', 'tags', 'url']
    // })

    // const res = fuse.search('asd')

    // console.log(inspect(res, false, null, true))

    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
}

////////////////////////////////////////////////////////////////////////////////
main();
////////////////////////////////////////////////////////////////////////////////
