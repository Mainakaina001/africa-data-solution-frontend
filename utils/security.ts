import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert, BackHandler } from 'react-native';

const BIOMETRIC_KEY = 'biometric_enabled';

/**
 * Checks if the device is rooted or jailbroken (experimental check).
 * Returns true if the device is rooted/compromised, false otherwise.
 * Always returns false in emulator/simulator to allow developer testing.
 */
export async function checkDeviceIntegrity(): Promise<boolean> {
    if (!Device.isDevice) {
        // Allow emulators for development
        return false;
    }

    try {
        const isRooted = await Device.isRootedExperimentalAsync();
        return isRooted;
    } catch {
        // Fallback to safe default if check fails
        return false;
    }
}

/**
 * Checks if biometric hardware is present on the device.
 */
export async function hasBiometricHardware(): Promise<boolean> {
    try {
        return await LocalAuthentication.hasHardwareAsync();
    } catch {
        return false;
    }
}

/**
 * Checks if biometric hardware is present and has enrolled fingerprints or FaceID.
 */
export async function isBiometricsSupported(): Promise<boolean> {
    try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    } catch {
        return false;
    }
}

/**
 * Performs local biometric authentication.
 * Returns true if successful, false otherwise.
 */
export async function authenticateWithBiometrics(
    promptMessage: string = 'Confirm your identity'
): Promise<boolean> {
    try {
        const supported = await isBiometricsSupported();
        if (!supported) {
            return false;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage,
            fallbackLabel: 'Use PIN',
            cancelLabel: 'Cancel',
            disableDeviceFallback: false,
        });

        return result.success;
    } catch {
        return false;
    }
}

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_saved_credentials';
const BIOMETRIC_PIN_KEY = 'biometric_saved_pin';

export interface BiometricCredentials {
    email: string;
    password?: string;
}

/**
 * Saves login credentials for biometric login.
 */
export async function saveBiometricCredentials(credentials: BiometricCredentials): Promise<void> {
    try {
        await SecureStore.setItemAsync(
            BIOMETRIC_CREDENTIALS_KEY,
            JSON.stringify(credentials),
            { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }
        );
    } catch {
        // Silently fail if secure store unavailable
    }
}

/**
 * Retrieves saved biometric login credentials.
 */
export async function getBiometricCredentials(): Promise<BiometricCredentials | null> {
    try {
        const raw = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as BiometricCredentials;
    } catch {
        return null;
    }
}

/**
 * Clears saved biometric login credentials.
 */
export async function clearBiometricCredentials(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    } catch {
        // Ignore delete errors
    }
}

/**
 * Saves transaction PIN for biometric transaction approval.
 */
export async function saveBiometricPin(pin: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(BIOMETRIC_PIN_KEY, pin, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
    } catch {
        // Ignore
    }
}

/**
 * Retrieves saved transaction PIN for biometric transaction approval.
 */
export async function getBiometricPin(): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(BIOMETRIC_PIN_KEY);
    } catch {
        return null;
    }
}

/**
 * Clears saved biometric PIN.
 */
export async function clearBiometricPin(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(BIOMETRIC_PIN_KEY);
    } catch {
        // Ignore
    }
}

/**
 * Persists the user's preference for biometric authentication.
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
        await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? 'true' : 'false', {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
        if (!enabled) {
            await clearBiometricCredentials();
            await clearBiometricPin();
        }
    } catch {
        // Silently fail if secure store is unavailable
    }
}

/**
 * Checks if the user has enabled biometric authentication.
 */
export async function getBiometricEnabled(): Promise<boolean> {
    try {
        const val = await SecureStore.getItemAsync(BIOMETRIC_KEY);
        return val === 'true';
    } catch {
        return false;
    }
}

/**
 * Utility to alert the user and close the application if device integrity check fails.
 */
export function handleCompromisedDevice() {
    Alert.alert(
        'Security Risk',
        'This device appears to be rooted or jailbroken. For your financial security, this application cannot run on compromised devices.',
        [
            {
                text: 'Exit',
                onPress: () => BackHandler.exitApp(),
                style: 'cancel',
            },
        ],
        { cancelable: false }
    );
}
