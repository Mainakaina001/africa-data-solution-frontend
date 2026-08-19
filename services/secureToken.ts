/**
 * secureToken.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * VULN-001 FIX: Replaces AsyncStorage with expo-secure-store for JWT storage.
 *
 * expo-secure-store uses:
 *   • Android Keystore (hardware-backed AES-256 encryption)
 *   • iOS Keychain (Secure Enclave on supported devices)
 *
 * The token is NEVER stored in plaintext. It is inaccessible to other apps,
 * and on iOS is bound to the device (WHEN_UNLOCKED_THIS_DEVICE_ONLY).
 * ─────────────────────────────────────────────────────────────────────────────
 */
import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Retrieve the stored JWT from the device's secure keychain/keystore.
 * Returns null if no token is stored or if retrieval fails.
 */
export const getToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch {
        // Secure store read failure — treat as unauthenticated
        return null;
    }
};

/**
 * Persist the JWT to the device's secure keychain/keystore.
 * - iOS: stored in Keychain, accessible only when device is unlocked,
 *   NOT backed up to iCloud, bound to THIS device.
 * - Android: encrypted with AES-256 via the Android Keystore system.
 */
export const saveToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token, {
        // iOS: token only readable when device is actively unlocked.
        // This prevents background read access by malicious processes.
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
};

/**
 * Delete the JWT from secure storage (called on logout).
 */
export const removeToken = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch {
        // Already deleted or never set — safe to ignore
    }
};

export const getRefreshToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
        return null;
    }
};

export const saveRefreshToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
};

export const removeRefreshToken = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
        // Safe to ignore
    }
};
