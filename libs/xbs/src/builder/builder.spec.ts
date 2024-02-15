// Imports /////////////////////////////////////////////////////////////////////
import { describe, it, expect } from 'vitest'
import { XbsBuilder } from './builder'

// Tests ///////////////////////////////////////////////////////////////////////
describe('builder', () => {
    it('should return error', async () => {
        const xbs = await new XbsBuilder().finish()
        expect(xbs.err).toBe(true)
    })

    it('should return ok', async () => {
        const xbs = await new XbsBuilder()
            .setCredentials('asdf', '123')
            .finish()

        expect(xbs.ok).toBe(true)
    })
})

////////////////////////////////////////////////////////////////////////////////
