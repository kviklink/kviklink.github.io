// Imports /////////////////////////////////////////////////////////////////////
import { Option, Some } from 'ts-results'
import { type IFolder, type ExtIFolder } from '../parser'
import { toValue } from 'ts-results-utils'
import { Bookmark } from './bookmark'

// Interfaces //////////////////////////////////////////////////////////////////
export interface FolderData {
    readonly type        : 'folder'
    readonly id          : number
    readonly title       : Option<string>
}

// Bookmark Class //////////////////////////////////////////////////////////////
export class Folder {
    // Public Attributes ///////////////////////////////////////////////////////
    public parent: Option<Folder>

    // Private Attributes //////////////////////////////////////////////////////
    public readonly data: FolderData
    public children: (Folder | Bookmark)[] = []

    // Constructor /////////////////////////////////////////////////////////////
    constructor(parent: Option<Folder>, data: ExtIFolder) {
        this.parent = parent

        // Remove `children` and set `data` attribute
        const { children, ...rest } = data
        this.data = { ...rest }
    }

    // Methods /////////////////////////////////////////////////////////////////
    public setParent(parent: Folder) {
        this.parent = Some(parent)
    }

    public addChild(child: Folder | Bookmark) {
        this.children.push(child)
    }

    public addChildAfter(
        child: Folder | Bookmark, pos: Folder | Bookmark | number | null
    ) {
        // Special case: if pos === null move to front
        if (pos === null) {
            this.children.unshift(child)
            return
        }

        // Finde the item after which the child should be added
        let after: Folder | Bookmark | undefined
        if (typeof pos === 'number') {
            after = this.children.find(c => c.data.id === pos)

        } else {
            after = this.children.find(c => c === pos)
        }

        // Calculate the index of the item
        const index = after
            ? this.children.indexOf(after)
            : (this.children.length - 1)

        // Add the child
        this.children.splice(index + 1, 0, child)
    }

    public removeChild(child: Folder | Bookmark) {
        this.children = this.children.filter(c => c !== child)
    }

    /**
     * Converts the {@link Bookmark} class back to xBrowserSync bookmark.
     */
    public toXbs(): IFolder {
        return {
            id          : this.data.id,
            title       : toValue(this.data.title),
            children    : this.children.map(c => c.toXbs()) // no children = []
        }
    }

}

////////////////////////////////////////////////////////////////////////////////
