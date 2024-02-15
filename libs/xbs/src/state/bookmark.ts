// Imports /////////////////////////////////////////////////////////////////////
import { Option, Some } from 'ts-results'
import type { IBookmark, ExtIBookmark } from '../parser'
import { toValue } from 'ts-results-utils'
import { Folder } from './folder'

// Bookmark Class //////////////////////////////////////////////////////////////
export class Bookmark {
    // Public Attributes ///////////////////////////////////////////////////////
    public parent: Option<Folder>

    // Private Attributes //////////////////////////////////////////////////////
    public readonly data: ExtIBookmark

    // Constructor /////////////////////////////////////////////////////////////
    constructor(parent: Option<Folder>, data: ExtIBookmark) {
        this.parent = parent
        this.data = data
    }

    // Methods /////////////////////////////////////////////////////////////////
    public setParent(parent: Folder) {
        this.parent = Some(parent)
    }

    /**
     * Converts the {@link Bookmark} class back to xBrowserSync bookmark.
     */
    public toXbs(): IBookmark {
        return {
            id          : this.data.id,
            title       : toValue(this.data.title),
            description : toValue(this.data.description),
            url         : this.data.url,
            tags        : (() => {
                if (this.data.tags.length > 0) {
                    return this.data.tags
                }

                return undefined
            })()
        }
    }

}

////////////////////////////////////////////////////////////////////////////////
