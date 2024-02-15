// Imports /////////////////////////////////////////////////////////////////////
import { ExtIBookmark, ExtIFolder, parse } from '.'
import { describe, it, expect } from 'vitest'
import { None } from 'ts-results'

// Tests ///////////////////////////////////////////////////////////////////////
describe('parser: parse bookmark', () => {
    it('should parse full bookmark', () => {
        // Prepare
        const bookmark = [
            {
                id          : 1,
                title       : 'asdf',
                description : 'desc',
                url         : 'https://duckduckgo.org',
                tags        : [ 'a', 'b' ]
            }
        ]

        // Execute
        const result = parse(bookmark)

        // Assert
        expect(result.ok).toBe(true)
    })

    it('should parse partial bookmark', () => {
        // Prepare
        const bookmark = [
            {
                id          : 1,
                // title       : 'asdf',
                // description : 'desc',
                url         : 'https://duckduckgo.org',
                // tags        : [ 'a', 'b' ]
            }
        ]

        // Execute
        const result = parse(bookmark)

        // Assert
        expect(result.ok).toBe(true)

        if (result.ok) {
            const bm = result.val[0] as ExtIBookmark
            expect(bm.title).toEqual(None)
            expect(bm.description).toEqual(None)
            expect(bm.tags).toEqual([])
        }
    })

    it('should fail parsing bookmark', () => {
        // Prepare
        const bookmark = [
            {
                id          : 1,
                // title       : 'asdf',
                // description : 'desc',
                // url         : 'https://duckduckgo.org',
                // tags        : [ 'a', 'b' ]
            }
        ]

        // Execute
        const result = parse(bookmark)

        // Assert
        expect(result.ok).toBe(false)
    })
})

describe('parser: parse folder', () => {
    it('should parse full folder', () => {
        // Prepare
        const folder = [
            {
                id          : 1,
                title       : 'asdf',
                children    : [
                    {
                        id          : 1,
                        title       : 'asdf',
                        description : 'desc',
                        url         : 'https://duckduckgo.org',
                        tags        : [ 'a', 'b' ]
                    }
                ]
            }
        ]

        // Execute
        const result = parse(folder)

        // Assert
        expect(result.ok).toBe(true)
    })

    it('should parse partial folder', () => {
        // Prepare
        const folder = [
            {
                id          : 1,
                children    : []
            }
        ]

        // Execute
        const result = parse(folder)

        // Assert
        expect(result.ok).toBe(true)

        if (result.ok) {
            const bm = result.val[0] as ExtIFolder
            expect(bm.children).toEqual([])
        }
    })

    it('should fail to parse folder', () => {
        // Prepare
        const folder = [
            {
                id          : 1,
                title       : 'asdf'
            }
        ]

        // Execute
        const result = parse(folder)

        // Assert
        expect(result.ok).toBe(false)
    })
})

describe('parser: transformation', () => {
    it('should transform input data', () => {
        // Prepare
        const folder = [
            {
                id          : 1,
                title       : 'asdf',
                children    : [
                    {
                        id          : 2,
                        description : 'desc',
                        url         : 'https://duckduckgo.org',
                        tags        : [ 'a', 'b', 'c' ]
                    },
                    {
                        id          : 3,
                        title       : 'b',
                        url         : 'https://duckduckgo.org'
                    }
                ]
            },
            {
                id          : 4,
                title       : 'asdf',
                description : 'desc',
                url         : 'https://duckduckgo.org',
                tags        : [ 'a', 'b' ]
            },
            {
                id          : 5,
                title       : 'asdf',
                children    : [
                    {
                        id          : 6,
                        title       : 'b',
                        url         : 'https://duckduckgo.org'
                    },
                    {
                        id          : 7,
                        title       : 'asdf',
                        children    : [
                            {
                                id          : 8,
                                title       : 'b',
                                url         : 'https://duckduckgo.org'
                            },
                        ]
                    }
                ]
            },
        ]

        // Execute
        const result = parse(folder)

        // Assert
        expect(result.ok).toBe(true)

        if (result.ok) {
            // Folder 1
            const f1 = result.val[0] as ExtIFolder
            expect(f1.type).toBe('folder')

            // Folder 1 - child 1 + 2
            expect(f1.children[0].type).toBe('bookmark')
            expect(f1.children[1].type).toBe('bookmark')

            // Root-level bookmark
            const b1 = result.val[1] as ExtIBookmark
            expect(b1.type).toBe('bookmark')

            // Folder 2
            const f2 = result.val[2] as ExtIFolder
            expect(f2.type).toBe('folder')

            // Folder 2 - child 1
            expect(f2.children[0].type).toBe('bookmark')

            // Folder 2 - child 2 (folder 3)
            const f3 = f2.children[1] as ExtIFolder
            expect(f3.type).toBe('folder')
            expect(f3.children[0].type).toBe('bookmark')
        }
    })
})

////////////////////////////////////////////////////////////////////////////////
