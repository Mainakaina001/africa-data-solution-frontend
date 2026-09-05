/**
 * notificationService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages push notification permissions, device token registration, and
 * foreground notification display using expo-notifications.
 *
 * Flow:
 *   1. Request permission from OS.
 *   2. Get native device push token (FCM on Android, APNs on iOS).
 *   3. POST token to /notifications/register-token so the backend can target
 *      this device.
 *   4. On logout, DELETE /notifications/token to prevent stale token delivery.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { registerNotificationToken, removeNotificationToken } from "./api";

// Show notifications when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Requests notification permissions from the OS.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!Device.isDevice) {
        // Emulators / simulators cannot receive push notifications
        console.log("[Notifications] Skipping – not a physical device.");
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("[Notifications] Permission not granted.");
        return false;
    }

    // Android-specific channel setup
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }

    return true;
}

/**
 * Obtains the native device push token and registers it with the backend.
 * Safe to call on every login – the backend should be idempotent.
 */
export async function registerDeviceToken(): Promise<void> {
    try {
        const granted = await requestNotificationPermission();
        if (!granted) return;

        // getDevicePushTokenAsync returns the raw FCM / APNs token the backend expects
        const tokenObj = await Notifications.getDevicePushTokenAsync();
        const fcmToken = tokenObj.data;

        await registerNotificationToken({ fcmToken });
        console.log("[Notifications] Token registered:", fcmToken.slice(0, 20) + "...");
    } catch (err) {
        // Never block login/logout on notification errors
        console.warn("[Notifications] Failed to register token:", err);
    }
}

/**
 * Removes the device push token from the backend.
 * Called on logout so the server stops delivering messages to this device.
 */
export async function unregisterDeviceToken(): Promise<void> {
    try {
        await removeNotificationToken();
        console.log("[Notifications] Token removed from backend.");
    } catch (err) {
        console.warn("[Notifications] Failed to remove token:", err);
    }
}
