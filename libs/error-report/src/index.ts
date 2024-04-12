// Imports /////////////////////////////////////////////////////////////////////

// Report //////////////////////////////////////////////////////////////////////
export class Report {
    // Attributes //////////////////////////////////////////////////////////////
    private current: Error
    private log: Error[]

    // Constructor /////////////////////////////////////////////////////////////
    private constructor(e: Error) {
        this.current = e
        this.log = []
    }

    // Public Methods //////////////////////////////////////////////////////////
    public static from(e: unknown): Report {
        return new Report(e as Error)
    }

    /**
     * Changes the context of the report.
     */
    public add(e: Error): this {
        this.log.unshift(this.current)
        this.current = e

        return this
    }

    public getErrors(): Error[] {
        const list = [...this.log]
        list.unshift(this.current)
        return list
    }

    public toString(): string {
        const errors = this.getErrors().map(e => `${e.name}: ${e.message}`)
        let str = 'Error Report:\n'
        let counter = 0
        for (const err of errors) { str += `  [${counter++}] ${err}\n` }

        return str
    }

    ////////////////////////////////////////////////////////////////////////////
}

////////////////////////////////////////////////////////////////////////////////
