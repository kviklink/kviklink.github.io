// Imports /////////////////////////////////////////////////////////////////////
import { Option, Some, None, Result, Ok, Err } from 'ts-results'
import { RaindropClient } from '..'

// XbsState ////////////////////////////////////////////////////////////////////
export class RaindropBuilder {
    private testToken: Option<string> = None

    public setTestToken(testToken: string): RaindropBuilder {
        this.testToken = Some(testToken)

        return this
    }

    public finish(): Result<RaindropClient, string> {
        // Check if all credentials are present and return
        if (this.testToken.some) {
            return Ok(new RaindropClient(this.testToken.val))

        } else {
            return Err('failed to build raindriop client: token not set')
        }
    }
}

// Errors //////////////////////////////////////////////////////////////////////
export class XbsBuilderError extends Error {
    constructor() { super('failed to build Xbs client: credentials not set') }
}

////////////////////////////////////////////////////////////////////////////////
