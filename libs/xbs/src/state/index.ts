// Re-Exports //////////////////////////////////////////////////////////////////
export * from './bookmark'
export * from './folder'

// Imports /////////////////////////////////////////////////////////////////////
import { Result, Ok, Err, None, Option, Some } from 'ts-results'
import { v4 as uuidv4 } from 'uuid'
import { Folder } from './folder';
import { Bookmark } from './bookmark';
import type {
    IXbsData, ExtIFolder, ExtIBookmark, IFolder, IBookmark
} from '../parser'

// XbsState ////////////////////////////////////////////////////////////////////
export class XbsState {
    // Attributes //////////////////////////////////////////////////////////////
    public readonly root: Folder

    // Constructor /////////////////////////////////////////////////////////////
    private constructor(root: Folder) {
        this.root = root
    }

    // Methods /////////////////////////////////////////////////////////////////
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
        const visited: Set<number> = new Set([ this.root.data.id ])

        let largestId = 0

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            // Check if ID is larger
            if (node.data.id > largestId) { largestId = node.data.id }

            // If node is a folder, add its children to the queue
            if (node instanceof Folder) {
                for (const child of node.children) {
                    if (!visited.has(child.data.id)) {
                        visited.add(child.data.id)
                        queue.push(child)
                    }
                }
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
        const visited: Set<number> = new Set([ this.root.data.id ])

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            // Check if id matches
            if (node.data.id === id) { return Some(node) }

            // Add children to queue
            if (node instanceof Folder) {
                for (const child of node.children) {
                    if (!visited.has(child.data.id)) {
                        visited.add(child.data.id)
                        queue.push(child)
                    }
                }
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
        const visited: Set<number> = new Set([ this.root.data.id ])

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            // Check if id matches
            if (node.data.id === id) { return Some(node) }

            // Otherwise, add children to queue
            for (const child of node.children) {
                // Skip non-folder children
                if (!(child instanceof Folder)) { continue }

                if (!visited.has(child.data.id)) {
                    visited.add(child.data.id)
                    queue.push()
                }
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
        const visited: Set<number> = new Set([ this.root.data.id ])

        while (queue.length > 0) {
            // Get first node from queue
            const node = queue.shift()!

            if (node instanceof Bookmark) {
                // Check if id matches
                if (node.data.id === id) { return Some(node) }

            } else {
                for (const child of node.children) {
                    if (!visited.has(child.data.id)) {
                        visited.add(child.data.id)
                        queue.push(child)
                    }
                }
            }
        }

        return None
    }

    /**
     * Adds the given `child` to the `destination` and returns the destination
     * folder which then contains the newly added `child`.
     */
    public add(
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
        if (src.parent.none) { return Err('source has no parent') }
        src.parent.val.removeChild(src)
        dst.addChild(src)

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
        if (tar.parent.none) { return Err('target has no parent') }
        tar.parent.val.removeChild(tar)

        // Return
        return Ok(tar)
    }

    // Static Methods //////////////////////////////////////////////////////////

    /**
     * Create {@link XbsState} from {@link IXbsData}, which is the return value
     * from the `parse` function.
     */
    public static from(data: IXbsData): Result<XbsState, string> {
        // Create a root folder which wraps around the input data.
        const root: ExtIFolder = {
            type: 'folder',
            id: -1,
            title: None,
            children: data, // <- input data as children of root folder
        }

        // Define metadata for traversal/discovery (depth first search).
        interface Metadata {
            // Node uuid
            uuid: string,
            // Parent uuid
            parent: Option<number>,
            // Data
            data: ExtIFolder | ExtIBookmark
        }

        /**
         * Traverse data structure (depth first search) and discover all nodes.
         * During this process metadata is added (uuid and parent-uuid) for the
         * next processing step.
         */
        const stack: Metadata[] = [{ uuid: uuidv4(), parent: None, data: root }]
        const discovered: Set<string> = new Set()
        const nodes: Metadata[] = []

        while (stack.length > 0) {
            // Get upper stack item
            const node = stack.pop()!

            // If node was not discovered yet...
            if (!discovered.has(node.uuid)) {
                // Mark node as discovered and add it to the nodes array
                discovered.add(node.uuid)
                nodes.push(node)

                // If node is a folder, add its children to the stack
                if (node.data.type === 'folder') {
                    // Iterate children
                    for (const child of node.data.children) {
                        // Add to the bottom of the stack (to keep the order)
                        stack.unshift({
                            uuid    : uuidv4(),
                            parent  : Some(node.data.id),
                            data    : child,
                        })
                    }
                }
            }
        }

        // Ensure unique ids
        const ids = new Set(nodes.map(n => n.data.id))
        if (ids.size !== nodes.length) {
            return Err('duplicate ids')
        }

        /**
         * The depth first traversal discovered all nodes in depth-first order.
         * This means that the parents are always discovered before their
         * children. Therefore we an no initialize the state and iteratively
         * add all the nodes into the state.
         */
        const state = new XbsState(new Folder(None, root))
        for (const node of nodes) {
            // If node is a folder
            if (node.data.type === 'folder') {
                // Create a folder
                const folder = new Folder(None, node.data)

                // Validate parent id
                if (node.parent.none) {
                    return Err('something went wrong: no parent for folder')
                }

                // Add this folder to the state (which sets the parent)
                state.add(folder, node.parent.val)
            }
            // Else, it's a bookmark
            else {
                // Create bookmark
                const bookmark = new Bookmark(None, node.data)

                // Validate parent id
                if (node.parent.none) {
                    return Err('something went wrong: no parent for bookmark')
                }

                // Add this bookmark to the state (which sets the parent)
                state.add(bookmark, node.parent.val)
            }
        }

        // Return state
        return Ok(state)
    }
}

////////////////////////////////////////////////////////////////////////////////
