// Import //////////////////////////////////////////////////////////////////////
import { Result, Ok, Err } from 'ts-results'
import { XbsBuilder, type Xbs } from 'xbs'
import { type IBackend, type IBackendBuilder } from '.'
import { z } from 'zod'

// Builder /////////////////////////////////////////////////////////////////////
export const XbsBackendBuilder: IBackendBuilder = {
    /**
     * In case of xBrowserSync "login" means that
     *  -   the provided plaintext password is hashed+salted
     *  -   request to the server is made to make sure the password is correct
     *
     * @param credentials as `{ syncId: string, password: string}`
     * @returns {Result<IBackend, string>}
     */
    login: async (credentials: Record<string, unknown>): Promise<Result<IBackend, string>> => {
        // Validate and parse credentials
        const schema = z.object({
            syncId  : z.string().min(1),
            password: z.string().min(1)
        }).strict();

        const parsed = schema.safeParse(credentials)
        if (!parsed.success) { return Err(parsed.error.toString()) }

        // Create Xbs client with XbsBuilder (using plaintext credentials)
        const xbs = await new XbsBuilder()
            .setCredentials(parsed.data.syncId, parsed.data.password)
            .finish()

        if (xbs.err) { return Err(xbs.val) }

        // Execute 'get' to make sure everything works
        const res = await xbs.val.get()
        if (res.err) { return Err(res.val) }

        // Return Xbs backend
        return Ok(new XbsBackend(xbs.val))
    },

    auth: async (credentials: unknown): Promise<Result<IBackend, string>> => {
        // Validate and parse credentials
        const schema = z.object({
            syncId      : z.string().min(1),
            base64key   : z.string().min(1)
        }).strict();

        const parsed = schema.safeParse(credentials)
        if (!parsed.success) { return Err(parsed.error.toString()) }

        // Create Xbs client with XbsBuilder (using plaintext credentials)
        const xbs = await new XbsBuilder()
            .setRawCredentials(parsed.data.syncId, parsed.data.base64key)
            .finish()

        if (xbs.err) { return Err(xbs.val) }

        // Execute 'get' to make sure everything works
        const res = await xbs.val.get()
        if (res.err) { return Err(res.val) }

        // Return Xbs backend
        return Ok(new XbsBackend(xbs.val))
    },
}

// Backend /////////////////////////////////////////////////////////////////////
export class XbsBackend implements IBackend {
    // Attributes //////////////////////////////////////////////////////////////
    private xbs: Xbs

    // Constructor /////////////////////////////////////////////////////////////
    public constructor(xbs: Xbs) { this.xbs = xbs }

    // IBookmark Methods ///////////////////////////////////////////////////////
    canRead(): true { return true }
    canManage(): boolean { return false }
    canStoreConfig(): boolean { return false }
    getCredentials(): Record<string, unknown> {
        return {
            syncId: this.xbs.syncId,
            base64key: this.xbs.base64key,
        }
    }

    // IBookmarkReader Methods /////////////////////////////////////////////////
    async get(): Promise<unknown> { return this.xbs.get() }

    ////////////////////////////////////////////////////////////////////////////
}

////////////////////////////////////////////////////////////////////////////////
