// Imports /////////////////////////////////////////////////////////////////////
import { describe, it, expect } from 'vitest'
import { RaindropBuilder } from './builder'

// Tests ///////////////////////////////////////////////////////////////////////
describe('builder', () => {
    it('should return error', async () => {
        const xbs = await new RaindropBuilder().finish()
        expect(xbs.err).toBe(true)
    })

    it('should return ok', async () => {
        const xbs = await new RaindropBuilder()
            .setTestToken('123')
            .finish()

        expect(xbs.ok).toBe(true)
    })
})

////////////////////////////////////////////////////////////////////////////////
