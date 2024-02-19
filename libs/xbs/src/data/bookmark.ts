// Imports /////////////////////////////////////////////////////////////////////
import { Option, Some } from 'ts-results'
import type { IBookmark, XIBookmark } from '../parser'
import { toValue } from 'ts-results-utils'
import { Folder } from './folder'

// Bookmark Class //////////////////////////////////////////////////////////////
export class Bookmark implements XIBookmark {
    // Public Attributes ///////////////////////////////////////////////////////
    public _parent: Option<Folder>

    public readonly _type = 'bookmark'
    public readonly id: number
    public readonly title: Option<string>
    public readonly description: Option<string>
    public readonly url: string
    public readonly tags: string[]

    // Private Attributes //////////////////////////////////////////////////////
    // public readonly data: XIBookmark

    // Constructor /////////////////////////////////////////////////////////////
    constructor(parent: Option<Folder>, data: XIBookmark) {
        this._parent = parent
        this.id = data.id
        this.title = data.title
        this.description = data.description
        this.url = data.url
        this.tags = data.tags
    }

    // Methods /////////////////////////////////////////////////////////////////
    public setParent(parent: Folder) {
        this._parent = Some(parent)
    }

    /**
     * Converts the {@link Bookmark} class back to xBrowserSync bookmark.
     */
    public toXbs(): IBookmark {
        return {
            id          : this.id,
            title       : toValue(this.title),
            description : toValue(this.description),
            url         : this.url,
            tags        : (() => {
                if (this.tags.length > 0) {
                    return this.tags
                }

                return undefined
            })()
        }
    }

}

////////////////////////////////////////////////////////////////////////////////
