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

/**
 * Persists the user's preference for biometric authentication.
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
        await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? 'true' : 'false');
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
