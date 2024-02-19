// Imports /////////////////////////////////////////////////////////////////////
import { describe, it, expect } from 'vitest'
import { XbsData } from '.'
import { None, Some } from 'ts-results'
import { XIBookmark, XIFolder } from '../parser'
import { parse } from '../parser'

// Tests ///////////////////////////////////////////////////////////////////////
describe('state: basic functionality', () => {
    it('should create an empty bookmarks instance', async () => {
        // Execution
        const state = XbsData.from([], '').unwrap()

        // Assertion
        expect(state.root.children).toEqual([])
        expect(state.toXbs()).toEqual([])
    })

    it('should calculate the next id', () => {
        // Preparation
        const data: (XIFolder | XIBookmark)[] = [
            {
                _type: 'bookmark',
                id: 1,
                title: Some('1t'),
                description: Some('1d'),
                url: '1url',
                tags: [],
            },
            {
                _type: 'folder',
                id: 2,
                title: Some('2t'),
                children: [
                    {
                        _type: 'bookmark',
                        id: 21,
                        title: Some('21t'),
                        description: Some('21d'),
                        url: '21url',
                        tags: [],
                    },
                    {
                        _type: 'folder',
                        id: 22,
                        title: Some('22t'),
                        children: [],
                    },
                ]
            }
        ]

        // Execution
        const state = XbsData.from(data, '').unwrap()

        // Assert
        expect(state.nextId()).toBe(23)
    })


    it('should create xBrowserSync data (1)', () => {
        // Execution
        const state = XbsData.from([], '').unwrap()

        // Assertion
        expect(state.toXbs()).toEqual([])
    })

    it('should create xBrowserSync data (2)', () => {
        // Execution
        const state = XbsData.from([
            {
                _type: 'bookmark',
                id: 1,
                title: Some('1t'),
                description: Some('1d'),
                url: '1u',
                tags: [],
            }
        ], '').unwrap()

        // Assertion
        expect(state.toXbs()).toEqual([
            { id: 1, title: '1t', description: '1d', url: '1u' }
        ])
    })

    it('should create xBrowserSync data (3)', () => {
        // Execution
        const state = XbsData.from([
            {
                _type: 'bookmark',
                id: 1,
                title: Some('1t'),
                description: None,
                url: '1u',
                tags: [],
            }
        ], '').unwrap()

        // Assertion
        expect(state.toXbs()).toEqual([
            { id: 1, title: '1t', url: '1u' }
        ])
    })

    it('should create xBrowserSync data (4)', () => {
        // Preparation
        const data: (XIFolder | XIBookmark)[] = [
            {
                _type: 'bookmark',
                id: 1,
                title: Some('1t'),
                description: None,
                url: '1url',
                tags: [ 'test' ],
            },
            {
                _type: 'folder',
                id: 2,
                title: Some('2t'),
                children: [
                    {
                        _type: 'bookmark',
                        id: 21,
                        title: Some('21t'),
                        description: Some('21d'),
                        url: '21url',
                        tags: [],
                    },
                    {
                        _type: 'folder',
                        id: 22,
                        title: None,
                        children: [],
                    },
                ]
            }
        ]

        // Execution
        const state = XbsData.from(data, '').unwrap()

        // Assert
        expect(state.toXbs()).toEqual([
            {
                id: 1, title: '1t', url: '1url', tags: ['test']
            },
            {
                id: 2, title: '2t',
                children: [
                    {
                        id: 21, title: '21t', description: '21d', url: '21url'
                    },
                    {
                        id: 22, children: []
                    },
                ]
            }
        ])
    })
})


describe('state: maintain xBrowserSync datastructure', () => {
    it('should not alter data structure (1)', () => {
        // Preparation
        const data = [
            { id: 1, url: '' },
            { id: 2, url: '' },
            { id: 3, children: [
                { id: 31, children: [
                    { id: 311, url: '' }
                ] }
            ] },
            { id: 4, url: '' },
            { id: 5, children: [
                { id: 51, url: '' }, { id: 52, url: '' }
            ] },
            { id: 6, url: '' },
            { id: 7, children: [] }
        ]

        const parsed = parse(data).unwrap()

        // Execution
        const state = XbsData.from(parsed, '').unwrap()

        // Assert
        expect(state.toXbs()).toEqual(data)
    })

    it('should not alter data structure (2)', () => {
        // Preparation
        const data = [
            { id: 1, title: '1t', description: '1d', url: '1url'},
            { id: 2, title: '2t', children: [
                { id: 21, title: '21t', description: '21d', url: '21url'}
            ]}
        ]

        const parsed = parse(data).unwrap()

        // Execution
        const state = XbsData.from(parsed, '').unwrap()

        // Assert
        expect(state.toXbs()).toEqual(data)
    })
})

describe('state: query datastructure', () => {
    describe('find by id: fail', () => {
        it('should not find a bookmark of folder', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.findById(123)

            // Assertion
            expect(result).toEqual(None)
        })

        it('should not find a bookmark', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.findBookmarkById(123)

            // Assertion
            expect(result).toEqual(None)
        })

        it('should not find a folder', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.findFolderById(123)

            // Assertion
            expect(result).toEqual(None)
        })
    })

    describe('find by id: success', () => {
        it('should find any (1)', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.findById(21)

            // Assertion
            expect(result.some).toBe(true)
            if (result.some) {
                const tmp = { ...result.val } as Record<string, unknown>
                delete tmp._parent

                expect(tmp).toEqual({
                    _type: 'bookmark',
                    id: 21,
                    title: Some('21t'),
                    description: Some('21d'),
                    url: '21url',
                    tags: []
                })
            }
        })

        it('should find a any (2)', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.findById(2)

            // Assertion
            expect(result.some).toBe(true)
            if (result.some) {
                const { _type, id, title } = result.val
                expect({ _type, id, title }).toEqual({
                    _type: 'folder',
                    id: 2,
                    title: Some('2t'),
                })
            }
        })

        it('should find a bookmark', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.findBookmarkById(21)

            // Assertion
            expect(result.some).toBe(true)
            if (result.some) {
                const tmp = { ...result.val } as Record<string, unknown>
                delete tmp._parent

                expect(tmp).toEqual({
                    _type: 'bookmark',
                    id: 21,
                    title: Some('21t'),
                    description: Some('21d'),
                    url: '21url',
                    tags: []
                })
            }
        })

        it('should find a folder', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.findFolderById(2)

            // Assertion
            expect(result.some).toBe(true)
            if (result.some) {
                const { _type, id, title } = result.val
                expect({ _type, id, title }).toEqual({
                    _type: 'folder',
                    id: 2,
                    title: Some('2t'),
                })
            }
        })
    })
})

describe('state: manipulate datastructure', () => {
    describe('add bookmarks', () => {
        it('should add a bookmark (1)', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const folder = state.findFolderById(2).unwrap()

            const result = state.addBookmark(
                { url: 'https://hello.world'},
                folder
            )

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                    { id: 22, url: 'https://hello.world'}
                ]}
            ])
        })

        it('should add a bookmark (2)', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const folder = state.root

            const result = state.addBookmark(
                { title: 'test', url: 'https://hello.world'},
                folder
            )

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                ]},
                { id: 22, title: 'test', url: 'https://hello.world'}
            ])
        })
    })

    describe('add folders', () => {
        it('should add a folder (1)', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const folder = state.findFolderById(2).unwrap()

            const result = state.addFolder({ title: 'new folder'}, folder)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                    { id: 22, title: 'new folder', children: []}
                ]}
            ])
        })

        it('should add a folder (2)', () => {
            // Preparation
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]}
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const folder = state.root

            const result = state.addFolder({}, folder)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                ]},
                { id: 22, children: [] }
            ])
        })
    })

    describe('move bookmarks', () => {
        it('should move bookmark by object', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const bookmark = state.findBookmarkById(3).unwrap()
            const folder = state.findFolderById(2).unwrap()

            const result = state.move(bookmark, folder)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                    { id: 3, title: '3t', description: '3d', url: '3url' },
                ]},
            ])
        })

        it('should move bookmark by id', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.move(21, -1)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [] },
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 21, title: '21t', description: '21d', url: '21url'},
            ])
        })
    })

    describe('move bookmarks to position', () => {
        it('should move bookmark to front of folder', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const bookmark = state.findBookmarkById(3).unwrap()
            const folder = state.findFolderById(2).unwrap()

            const result = state.moveTo(bookmark, folder, null)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 3, title: '3t', description: '3d', url: '3url' },
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                ]},
            ])
        })

        it('should move bookmark to position by object', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const bookmark = state.findBookmarkById(1).unwrap()
            const folder = state.findFolderById(2).unwrap()

            const result = state.moveTo(bookmark, state.root, folder)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                ]},
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ])
        })

        it('should move bookmark to position by id', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.moveTo(21, -1, 2)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [] },
                { id: 21, title: '21t', description: '21d', url: '21url'},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ])
        })
    })

    describe('move folders', () => {
        it('should move folder by object', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 4, children: [] },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const f = state.findFolderById(4).unwrap()
            const folder = state.findFolderById(2).unwrap()

            const result = state.move(f, folder)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                    { id: 4, children: [] },
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ])
        })

        it('should move folder by id', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 4, children: [] },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.move(4, 2)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                    { id: 4, children: [] },
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ])
        })
    })

    describe('move folders to position', () => {
        it('should move folder to front of folder', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 4, children: [] },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const f = state.findFolderById(4).unwrap()
            const folder = state.findFolderById(2).unwrap()

            const result = state.moveTo(f, folder, null)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 4, children: [] },
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ])
        })

        it('should move folder to position by object', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                    { id: 4, children: [] },
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const f = state.findFolderById(4).unwrap()
            const bookmark = state.findBookmarkById(1).unwrap()

            const result = state.moveTo(f, state.root, bookmark)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 4, children: [] },
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ])
        })

        it('should move folder to position by id', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                    { id: 4, children: [] },
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const result = state.moveTo(4, -1, 1)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 4, children: [] },
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'},
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
            ])
        })
    })

    describe('remove bookmarks/folders', () => {
        it('should remove bookmark by id', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 4, children: [] },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()

            const result = state.remove(3)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 4, children: [] },
            ])
        })

        it('should remove bookmark by object', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 4, children: [] },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const target = state.findById(3).unwrap()

            const result = state.remove(target)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 4, children: [] },
            ])
        })

        it('should remove folder by id', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 4, children: [] },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()

            const result = state.remove(2)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 4, children: [] },
            ])
        })

        it('should remove folder by object', () => {
            const data = [
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 2, title: '2t', children: [
                    { id: 21, title: '21t', description: '21d', url: '21url'}
                ]},
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 4, children: [] },
            ]

            const parsed = parse(data).unwrap()

            // Execution
            const state = XbsData.from(parsed, '').unwrap()
            const target = state.findById(2).unwrap()

            const result = state.remove(target)

            // Assertion
            expect(result.ok).toBe(true)
            expect(state.toXbs()).toEqual([
                { id: 1, title: '1t', description: '1d', url: '1url'},
                { id: 3, title: '3t', description: '3d', url: '3url' },
                { id: 4, children: [] },
            ])
        })
    })
})

////////////////////////////////////////////////////////////////////////////////
