// Imports /////////////////////////////////////////////////////////////////////
import { Option, Some, None, Result, Ok, Err } from 'ts-results'
import { Xbs } from '..'
import { CryptoUtils } from '../utils'

// Constants ///////////////////////////////////////////////////////////////////
const DEFAULT_BASE_URL  = 'https://api.xbrowsersync.org'
const DEFAULT_VERSION   = '1.1.13'

// XbsState ////////////////////////////////////////////////////////////////////
export class XbsBuilder {
    private baseUrl: string = DEFAULT_BASE_URL
    private version: string = DEFAULT_VERSION

    private syncId: Option<string> = None
    private base64key: Option<string> = None
    private base64keyPromise: Option<Promise<string>> = None

    public overwriteBaseUrl(baseUrl: string): XbsBuilder {
        this.baseUrl = baseUrl
        return this
    }

    public overwriteVersion(version: string): XbsBuilder {
        this.version = version
        return this
    }

    public setCredentials(syncId: string, plaintextPassword: string): XbsBuilder {
        this.syncId = Some(syncId)
        this.base64keyPromise = Some(
            CryptoUtils.hashPasswordAndBase64Enc(plaintextPassword, syncId)
        )

        return this
    }

    public async finish(): Promise<Result<Xbs, string>> {
        // Get the base64key
        if (this.base64keyPromise.none) { return Err('internal error') }

        const keyPromise = this.base64keyPromise.val
        const result = await Result.wrapAsync(() => keyPromise)
        if (result.err) { return Err('hashing key failed') }

        this.base64key = Some(result.val)

        if (this.syncId.some && this.base64key.some) {
            return Ok(new Xbs(
                this.baseUrl, this.version, this.syncId.val, this.base64key.val
            ))

        } else {
            return Err('failed to build xbs client: credentials not set')
        }
    }
}

// Errors //////////////////////////////////////////////////////////////////////
export class XbsBuilderError extends Error {
    constructor() { super('failed to build Xbs client: credentials not set') }
}

////////////////////////////////////////////////////////////////////////////////
