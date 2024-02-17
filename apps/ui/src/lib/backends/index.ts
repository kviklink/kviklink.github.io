// Re-Exports //////////////////////////////////////////////////////////////////
export * from './xbs'

// Imports /////////////////////////////////////////////////////////////////////
import type { Result } from 'ts-results'

// Types ///////////////////////////////////////////////////////////////////////
export const BACKENDS = ['xbs', 'raindrop'] as const
export type Backend = (typeof BACKENDS)[number]

// Interfaces //////////////////////////////////////////////////////////////////
export interface IBackendBuilder {
    /**
     * Log-in and return access-token, some key or any other credential.
     * This is usually done with a plaintext password.
     */
    login: (credentials: Record<string, unknown>) =>
        Promise<Result<IBackend, string>>,

    /**
     * Checks the credentials and then authenticates this client.
     * The credentials are usually some kind of token (access token, key, ...).
     */
    auth: (credentials: Record<string, unknown>) =>
        Promise<Result<IBackend, string>>,
}

export interface IBackend extends IBookmarkReader {
    /**
     * Always returns true because every backend needs to provide read access
     * to the bookmarks.
     */
    canRead(): true,

    /**
     * Function to check if the backend implementation provides bookmark
     * management functionality like "edit", "move", "delete".
     */
    canManage(): boolean,

    /**
     * Function to check if the backend implementation allows to store the
     * application configuration.
     */
    canStoreConfig(): boolean,

    /**
     * Returns the credentials currently in use by the backend implementation.
     * These credentials **should not** contain plaintext passwords but rader
     * consist of access-tokens, etc.
     * The data returned by this function is stored in local storage to allow
     * seamless re-authentication.
     */
    getCredentials(): Record<string, unknown>,
}

export interface IBookmarkReader {
    get: () => Promise<unknown>,
}

export interface IBookmarkManager {
    add(): void,
    move(): void,
    // ...
}

export interface IConfigStore {
    read(): void,
    write(): void,
}

////////////////////////////////////////////////////////////////////////////////
