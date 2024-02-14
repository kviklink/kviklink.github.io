////////////////////////////////////////////////////////////////////////////////
// Imports
import base64js from 'base64-js'
import lzutf8 from 'lzutf8'

// This is needed for 'webcrypto' to work under Node.js (v16)
import { webcrypto } from 'crypto'
const crypto = webcrypto as unknown as Crypto


////////////////////////////////////////////////////////////////////////////////
// CryptoUtils
export class CryptoUtils {
    ////////////////////////////////////////////////////////////////////////////
    // Private Static Attributes

    private static KEY_GEN_ALGORITHM    = 'PBKDF2'
    private static KEY_GEN_ITERATIONS   = 250000
    private static KEY_GEN_HASH_FUNC    = 'SHA-256'
    private static ENC_ALGORITHM        = 'AES-GCM'


    ////////////////////////////////////////////////////////////////////////////
    // Public Static Methods

    /**
     * Hash the given plaintext password with the given salt (sync id).
     * The returned value is base64 encoded.
     *
     * @param {string} plaintextPassword plaintext password
     * @param {string} saltSyncId sync id
     * @returns {string} hashed password
     */
    static async hashPasswordAndBase64Enc(
        plaintextPassword   : string,
        saltSyncId          : string,
    ): Promise<string> {
        // Create text encoder (for creating Uint8Arrays)
        const encoder = new TextEncoder()

        // Encode salt and plaintext password
        const encodedSalt       = encoder.encode(saltSyncId)
        const encodedPassword   = encoder.encode(plaintextPassword)

        // Create key from password
        const passwordKey = await crypto.subtle.importKey(
            'raw', encodedPassword, this.KEY_GEN_ALGORITHM, false, ['deriveKey']
        )

        // Create encryption key from password key
        const derivedEncryptionKey = await crypto.subtle.deriveKey(
            {
                name        : this.KEY_GEN_ALGORITHM,
                salt        : encodedSalt,
                iterations  : this.KEY_GEN_ITERATIONS,
                hash        : this.KEY_GEN_HASH_FUNC,
            },
            passwordKey,
            { name: this.ENC_ALGORITHM, length: 256 },
            true,
            [ 'encrypt', 'decrypt' ]
        )

        // Export the encryption key
        const encryptionKey = await crypto.subtle
            .exportKey('raw', derivedEncryptionKey)

        // Encode encryption key with base64
        const base64key = base64js.fromByteArray(new Uint8Array(encryptionKey))

        // Return the base64 encoded encryption key
        return base64key
    }

    /**
     * Decrypt data.
     *
     * @param {string} base64key base64 encoded encryption key
     * @param {any} encryptedData encrypted data
     * @returns {string} decrypted data
     */
    static async decrypt(
        base64key: string,
        encryptedData: string,
    ): Promise<string> {
        // Create byte array from key
        const keyByteArray = base64js.toByteArray(base64key)

        // Create byte array from data
        const encryptedDataByteArray = base64js.toByteArray(encryptedData)

        // Create initialization vector
        const iv = encryptedDataByteArray.slice(0, 16)

        // Extract encrypted payload
        const encryptedPayloadBuffer = encryptedDataByteArray.slice(16).buffer

        // Create encryption key (CryptoKey) from keyByteArray
        const encKey = await crypto.subtle.importKey(
            'raw', keyByteArray, this.ENC_ALGORITHM, false, ['decrypt']
        )

        // Decrypt
        const decryptedPayloadBytes = await crypto.subtle.decrypt(
            { name: this.ENC_ALGORITHM, iv: iv }, encKey, encryptedPayloadBuffer
        )

        // Decompress payload
        const decryptedPayload = lzutf8
            .decompress(new Uint8Array(decryptedPayloadBytes)) as string

        // Return
        return decryptedPayload
    }

    /**
     *
     */
    static async encrypt(
        base64key: string,
        plaintextData: string,
    ): Promise<string> {
        // Create byte array from key
        const keyByteArray = base64js.toByteArray(base64key)

        // Create initialization vector
        const iv = crypto.getRandomValues(new Uint8Array(16))

        // Compress data
        const compressedData = lzutf8.compress(plaintextData)

        // Create encryption key (CryptoKey) from keyByteArray
        const encKey = await crypto.subtle.importKey(
            'raw', keyByteArray, this.ENC_ALGORITHM, false, ['encrypt']
        )

        // Encrypt
        const encryptedPayload = await crypto.subtle.encrypt(
            { name: this.ENC_ALGORITHM, iv: iv },
            encKey,
            compressedData
        )

        // Combine iv and encrypted data
        const combinedData = this
            .concatUint8Arrays(iv, new Uint8Array(encryptedPayload))

        // Encode combined data with base64
        const encryptedData = base64js.fromByteArray(combinedData)

        // Return
        return encryptedData
    }


    ////////////////////////////////////////////////////////////////////////////
    // Private Static Methods

    private static concatUint8Arrays(
        firstArr: Uint8Array = new Uint8Array(),
        secondArr: Uint8Array = new Uint8Array()
    ): Uint8Array {
        const totalLength = firstArr.length + secondArr.length;
        const result = new Uint8Array(totalLength);
        result.set(firstArr, 0);
        result.set(secondArr, firstArr.length);
        return result;
    }

    ////////////////////////////////////////////////////////////////////////////
}

////////////////////////////////////////////////////////////////////////////////
