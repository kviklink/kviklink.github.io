// Imports /////////////////////////////////////////////////////////////////////
import { Option, Some, None } from 'ts-results'
import { z } from 'zod'
import { BackendsSchema } from './types'
import localStorage from '$lib/utils/local-storage'

// Constants ///////////////////////////////////////////////////////////////////
const LOCAL_STORAGE_KEY = 'credentials' as const

// Interface ///////////////////////////////////////////////////////////////////
const CredentialsSchema = z.object({
    backend: BackendsSchema,
    credentials: z.record(z.string(), z.unknown()),
})

type Credentials = z.infer<typeof CredentialsSchema>


// Initialize State ////////////////////////////////////////////////////////////
const auth = $state<{ data: Option<Credentials> }>({ data: None });

(() => {
    // Read from localstorage
    const result = localStorage.read(LOCAL_STORAGE_KEY, CredentialsSchema)
    if (result.err) { return }

    // Set value
    set(result.val)
})()


// Functions ///////////////////////////////////////////////////////////////////
/**
 * Get the credential data of type `Option<Credentials>`.
 */
function get() { return auth.data }

/**
 * Set the credential data.
 */
function set(data: Credentials) {
    auth.data = Some(data)
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
}

/**
 * Unset the credential data.
 */
function unset() {
    auth.data = None
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
}

// Export //////////////////////////////////////////////////////////////////////
export default {
    // Getter
    get data() { return get() },

    // Functions
    set     : set,
    unset   : unset,
}

////////////////////////////////////////////////////////////////////////////////
