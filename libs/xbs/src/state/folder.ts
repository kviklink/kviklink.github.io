// Imports /////////////////////////////////////////////////////////////////////
import { Option, Some } from 'ts-results'
import { IFolder, ExtIFolder } from '../parser'
import { toValue } from 'ts-results-utils'
import { Bookmark } from './bookmark'

// Interfaces //////////////////////////////////////////////////////////////////
export interface FolderData {
    type        : 'folder'
    id          : number
    title       : Option<string>
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
