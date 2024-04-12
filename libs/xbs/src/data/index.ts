// Re-Exports //////////////////////////////////////////////////////////////////
export * from './bookmark'
export * from './folder'

// Imports /////////////////////////////////////////////////////////////////////
import { Result, Ok, Err, None, Option, Some } from 'ts-results'
import { Folder } from './folder';
import { Bookmark } from './bookmark';
import { transformBookmark, transformFolder } from '../parser'
import type {
    IXbsData, XIFolder, XIBookmark, IFolder, IBookmark
} from '../parser'

// XbsData /////////////////////////////////////////////////////////////////////
export class XbsData {
    // Attributes //////////////////////////////////////////////////////////////
    public readonly root: Folder

    // The 'lastUpdated' value must always be sent to the API when the data
    // is updated. It basically tells the backend, how "old" the data is that
    // the request is sending. This is to prevent overwriting newer updates.
    public readonly lastUpdated: string

    // Constructor /////////////////////////////////////////////////////////////
    public constructor(root: Folder, lastUpdated: string) {
        this.root = root
        this.lastUpdated = lastUpdated
    }

    // Public Methods //////////////////////////////////////////////////////////
    /**
     * Convert the state to the xBrowserSync data structure
     */
    public toXbs(): (IFolder | IBookmark)[] {
        return this.root.toXbs().children || []
    }

    /**
     * Calculates the next free ID for a bookmark or folder.
     */
    public nextId(): number {
        // Breadth first search
        const queue: (Folder | Bookmark)[] = [ this.root ]
        // const visited: Set<number> = new Set([ this.root.data.id ])

        let largestId = 0

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            // Check if ID is larger
            if (node.id > largestId) { largestId = node.id }

            // If node is a folder, add its children to the queue
            if (node instanceof Folder) {
                queue.push(...node.children)
            }
        }

        // Return
        return largestId + 1
    }

    /**
     * Find {@link Folder} or {@link Bookmark} by `id`.
     */
    public findById(id: number): Option<Folder | Bookmark> {
        // Breadth first search
        const queue: (Folder | Bookmark)[] = [ this.root ]
        // const visited: Set<number> = new Set([ this.root.data.id ])

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            // Check if id matches
            if (node.id === id) { return Some(node) }

            // If node is a folder, add its children to the queue
            if (node instanceof Folder) {
                queue.push(...node.children)
            }
        }

        return None
    }

    /**
     * Find {@link Folder} by `id`.
     */
    public findFolderById(id: number): Option<Folder> {
        // Breadth first search
        const queue: Folder[] = [ this.root ]

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            // Check if id matches
            if (node.id === id) { return Some(node) }

            // Otherwise, add children to queue
            for (const child of node.children) {
                // Skip non-folder children
                if (!(child instanceof Folder)) { continue }
                queue.push(child)
            }
        }

        return None
    }

    /**
     * Find {@link Folder} by `title`
     */
    public findFolderByTitle(title: string): Option<Folder> {
        // Breadth first search
        const queue: Folder[] = [ this.root ]

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            // Check if title matches
            if (node.title.some && node.title.val === title) {
                return Some(node)
            }

            // Otherwise, add children to queue
            for (const child of node.children) {
                // Skip non-folder children
                if (!(child instanceof Folder)) { continue }
                queue.push(child)
            }
        }

        return None
    }

    /**
     * Find {@link Bookmark} by `id`.
     */
    public findBookmarkById(id: number): Option<Bookmark> {
        // Breadth first search
        const queue: (Folder | Bookmark)[] = [ this.root ]
        // const visited: Set<number> = new Set([ this.root.data.id ])

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            if (node instanceof Bookmark) {
                // Check if id matches
                if (node.id === id) { return Some(node) }

            } else {
                queue.push(...node.children)
            }
        }

        return None
    }

    /**
     * 
     */
    public findAllBookmarks(): Bookmark[] {
        // Breadth first serach
        const queue: (Folder | Bookmark)[] = [ this.root ]

        const result: Bookmark[] = []

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            if (node instanceof Bookmark) {
                result.push(node)

            } else {
                queue.push(...node.children)
            }
        }

        return result
    }

    /**
     * Adds a bookmark with the given information to the state.
     * This function adds a valid id to the data.
     */
    public addBookmark(
        child: Omit<IBookmark, 'id'>, destination: Folder | number
    ): Result<Folder, string> {
        // Create bookmark
        const data: IBookmark = { id: this.nextId(), ...child }
        const bookmark = new Bookmark(None, transformBookmark(data))

        // Get destination
        let dst: Folder
        if (destination instanceof Folder) {
            dst = destination

        } else {
            const dstFolder = this.findFolderById(destination)
                .toResult('destination not found')

            if (dstFolder.err) { return Err(dstFolder.val) }
            dst = dstFolder.val
        }

        // Add child
        bookmark.setParent(dst)
        dst.addChild(bookmark)

        // Return parent
        return Ok(dst)
    }

    /**
     * Adds a folder with the given information to the state.
     * This function adds a valid id to the data.
     */
    public addFolder(
        child: Omit<IFolder, 'id' | 'children'>, destination: Folder | number
    ): Result<Folder, string> {
        // Create folder
        const data: IFolder = { id: this.nextId(), children: [], ...child }
        const folder = new Folder(None, transformFolder(data))

        // Get destination
        let dst: Folder
        if (destination instanceof Folder) {
            dst = destination

        } else {
            const dstFolder = this.findFolderById(destination)
                .toResult('destination not found')

            if (dstFolder.err) { return Err(dstFolder.val) }
            dst = dstFolder.val
        }

        // Add child
        folder.setParent(dst)
        dst.addChild(folder)

        // Return parent
        return Ok(dst)
    }

    /**
     * Move a {@link Bookmark} or {@link Folder} to a {@link Folder}.
     */
    public move(
        source: Bookmark | Folder | number,
        destination: Folder | number
    ): Result<Folder, string> {
        // Get source
        let src: Bookmark | Folder
        if (source instanceof Bookmark || source instanceof Folder) {
            src = source

        } else {
            const result = this.findById(source)
                .toResult('source not found')

            if (result.err) { return Err(result.val) }
            src = result.val
        }

        // Get destination
        let dst: Folder
        if (destination instanceof Folder) {
            dst = destination

        } else {
            const dstFolder = this.findFolderById(destination)
                .toResult('destination not found')

            if (dstFolder.err) { return Err(dstFolder.val) }
            dst = dstFolder.val
        }

        // Move (delete src from its parent; add to new destination)
        if (src._parent.none) { return Err('source has no parent') }
        src._parent.val.removeChild(src)
        dst.addChild(src)

        // Return
        return Ok(dst)
    }

    public moveTo(
        source: Bookmark | Folder | number,
        destination: Folder | number,
        after: Folder | Bookmark | number | null,
    ): Result<Folder, string> {
        // Get source
        let src: Bookmark | Folder
        if (source instanceof Bookmark || source instanceof Folder) {
            src = source

        } else {
            const result = this.findById(source)
                .toResult('source not found')

            if (result.err) { return Err(result.val) }
            src = result.val
        }

        // Get destination
        let dst: Folder
        if (destination instanceof Folder) {
            dst = destination

        } else {
            const dstFolder = this.findFolderById(destination)
                .toResult('destination not found')

            if (dstFolder.err) { return Err(dstFolder.val) }
            dst = dstFolder.val
        }

        // Move (delete src from its parent; add to new destination)
        if (src._parent.none) { return Err('source has no parent') }
        src._parent.val.removeChild(src)
        dst.addChildAfter(src, after)

        // Return
        return Ok(dst)
    }

    /**
     * Remove a {@link Bookmark} or {@link Folder}.
     */
    public remove(
        target: Bookmark | Folder | number
    ): Result<Bookmark | Folder, string> {
        // Get target
        let tar: Bookmark | Folder
        if (target instanceof Bookmark || target instanceof Folder) {
            tar = target

        } else {
            const result = this.findById(target)
                .toResult('target not found')

            if (result.err) { return Err(result.val) }
            tar = result.val
        }

        // Remove target from its parent
        if (tar._parent.none) { return Err('target has no parent') }
        tar._parent.val.removeChild(tar)

        // Return
        return Ok(tar)
    }

    // Private Methods /////////////////////////////////////////////////////////
    /**
     * Adds the given `child` to the `destination` and returns the destination
     * The `child` is a full {@link Folder} or {@link Bookmark} object.
     * This function is private and only used when the state is initialized.
     */
    private addFull(
        child: Folder | Bookmark, destination: Folder | number
    ): Result<Folder, string> {
        // Get destination
        let dst: Folder
        if (destination instanceof Folder) {
            dst = destination

        } else {
            const dstFolder = this.findFolderById(destination)
                .toResult('destination not found')

            if (dstFolder.err) { return Err(dstFolder.val) }
            dst = dstFolder.val
        }

        // Add child
        child.setParent(dst)
        dst.addChild(child)

        // Return parent
        return Ok(dst)
    }

    // Static Methods //////////////////////////////////////////////////////////

    /**
     * Create {@link XbsData} from {@link IXbsData}, which is the return value
     * from the `parse` function.
     */
    public static from(
        data: IXbsData,
        lastUpdated: string
    ): Result<XbsData, string> {
        // Create a root folder which wraps around the input data.
        const root: XIFolder = {
            _type: 'folder',
            id: -1,
            title: None,
            children: data, // <- input data as children of root folder
        }

        // Define metadata for traversal/discovery (depth first search).
        interface Metadata {
            // Parent id
            parent: Option<number>,
            // Data
            data: XIFolder | XIBookmark
        }

        /**
         * Traverse data structure (breadth first search) to discover all nodes.
         * During traversal parent-information is added to the nodes (for next
         * step).
         * This traversal needs to be breadth first search, because before the
         * next step we need to remove the root nodes (multiple!) from the
         * result array of this first step. Breadth first search ensures that
         * these root nodes are the first ones in the `nodes` array.
         *
         * The breadth first search also assures that the order of all entries
         * is kept throughout the process of parsing the tree-structured data.
         */
        const queue: Metadata[] = [ {parent: None, data: root } ]

        // Result of the traversal
        const nodes: Metadata[] = []

        // Traversal
        while (queue.length > 0) {
            // Get next queue item
            const node = queue.shift()!
            nodes.push(node)

            // If node is a folder, add its children to the stack
            if (node.data._type === 'folder') {
                // Node data type guard
                const nodeData = node.data as XIFolder;

                // Add children to queue
                queue.push(...nodeData.children.map(c => { return {
                    parent: Some(nodeData.id),
                    data  : c
                }}))
            }
        }

        // Ensure unique ids
        const ids = new Set(nodes.map(n => n.data.id))
        if (ids.size !== nodes.length) { return Err('duplicate ids') }

        /**
         * The first step discovered all nodes. Parents are always discovered
         * before their children. This is important for the next step, because
         * when adding an item to "the datastructure" its parent must already
         * be present in the data.
         */

        // Take the first data.length items from the nodes array (because these
        // are the root elements with no parents). This mutates the nodes array.
        nodes.shift()
        // const roots = nodes.splice(0, data.length)

        // Initialize the state with the roots
        const state = new XbsData(new Folder(None, root), lastUpdated)

        // Iterate nodes
        for (const node of nodes) {
            // If node is a folder
            if (node.data._type === 'folder') {
                // Type guard
                const nodeData = node.data as XIFolder

                // Create a folder
                const folder = new Folder(None, nodeData)

                // Validate parent id
                if (node.parent.none) {
                    console.log(node)
                    return Err('something went wrong: no parent for folder')
                }

                // Add this folder to the state (which sets the parent)
                const res = state.addFull(folder, node.parent.val)
                if (res.err) {
                    return Err('inserting folder failed')
                }
            }
            // Else, it's a bookmark
            else {
                // Type guard
                const nodeData = node.data as XIBookmark

                // Create bookmark
                const bookmark = new Bookmark(None, nodeData)

                // Validate parent id
                if (node.parent.none) {
                    return Err('something went wrong: no parent for bookmark')
                }

                // Add this bookmark to the state (which sets the parent)
                const res = state.addFull(bookmark, node.parent.val)
                if (res.err) {
                    return Err('inserting bookmark failed')
                }
            }
        }

        // Return state
        return Ok(state)
    }
}

////////////////////////////////////////////////////////////////////////////////
