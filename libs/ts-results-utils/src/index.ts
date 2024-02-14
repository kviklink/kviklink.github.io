// Imports /////////////////////////////////////////////////////////////////////
import { Option, Some, None } from 'ts-results'

// Report //////////////////////////////////////////////////////////////////////
/**
 * Converts `T | undefined` to `Option<T>`.
 */
export function toOption<T>(val: T | undefined): Option<T> {
    if (val) { return Some(val) }
    return None
}

/**
 * Converts an `Option<T>` to `T | undefined`.
 */
export function toValue<T>(option: Option<T>): T | undefined {
    if (option.some) { return option.val }
    return undefined
}

////////////////////////////////////////////////////////////////////////////////
