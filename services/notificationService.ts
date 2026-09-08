/**
 * notificationService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages push notification permissions, FCM device token registration,
 * token rotation listeners, and notification channels using expo-notifications.
 *
 * Backend Requirements:
 *   1. Token Validation: Non-blank, 32–4096 characters (RegisterTokenRequest, NotificationController.java:6).
 *   2. Authentication: POST /api/v1/notifications/register-token requires a logged-in user.
 *   3. Idempotent Registration: Registered on every login, switching accounts, and app start.
 *   4. Token Rotation: Listens to FCM/APNs onNewToken events and re-registers automatically.
 *   5. Deregistration on Logout: DELETE /api/v1/notifications/token before credentials are wiped.
 *   6. Android Delivery Config: High priority, sound: "default", channelId: "africa_data_solutions".
 * ─────────────────────────────────────────────────────────────────────────────
 */
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { registerNotificationToken, removeNotificationToken } from "./api";
import { getToken } from "./secureToken";

export const NOTIFICATION_CHANNEL_ID = "africa_data_solutions";

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
 * Validates that an FCM device token satisfies the backend constraints:
 * Non-blank and between 32 and 4096 characters.
 */
export function isValidFcmToken(token: unknown): token is string {
    return (
        typeof token === "string" &&
        token.trim().length >= 32 &&
        token.trim().length <= 4096
    );
}

/**
 * Configures the platform-specific notification channel required by the backend.
 * Channel ID must match "africa_data_solutions" exactly on Android 8+.
 */
export async function setupNotificationChannels(): Promise<void> {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
            name: "Africa Data Solutions",
            description: "Notifications for orders, wallet transactions, and account updates",
            importance: Notifications.AndroidImportance.MAX,
            sound: "default",
            enableVibrate: true,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#0066CC",
            enableLights: true,
            showBadge: true,
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
    }
}

/**
 * Requests notification permissions from the OS and ensures channel setup.
 * Returns true if permission was granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!Device.isDevice) {
        // Emulators / simulators cannot receive push notifications
        console.log("[Notifications] Skipping – not a physical device.");
        return false;
    }

    // Ensure the channel is configured on Android
    await setupNotificationChannels();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("[Notifications] Push permission not granted.");
        return false;
    }

    return true;
}

/**
 * Obtains the native device push token (FCM on Android / APNs on iOS)
 * and registers it with the backend via POST /api/v1/notifications/register-token.
 *
 * @param authTokenOverride Optional accessToken (e.g. freshly acquired during login)
 */
export async function registerDeviceToken(authTokenOverride?: string): Promise<void> {
    try {
        // 1. Must be authenticated first
        const jwt = authTokenOverride || (await getToken());
        if (!jwt) {
            console.log("[Notifications] User is not authenticated; skipping token registration.");
            return;
        }

        // 2. Request permission and ensure channel is set
        const granted = await requestNotificationPermission();
        if (!granted) {
            console.log("[Notifications] Permission not granted; skipping token retrieval.");
            return;
        }

        // 3. Retrieve the device push token
        const tokenObj = await Notifications.getDevicePushTokenAsync();
        const fcmToken = tokenObj?.data;

        // 4. Validate token satisfies backend requirements (32–4096 characters, non-blank)
        if (!isValidFcmToken(fcmToken)) {
            console.warn(
                `[Notifications] Token failed validation (${typeof fcmToken === "string" ? fcmToken.length : "non-string"} chars). Expected 32-4096 chars.`
            );
            return;
        }

        // 5. Register with the backend
        await registerNotificationToken({ fcmToken: fcmToken.trim() });
        console.log("[Notifications] Device token registered successfully:", fcmToken.slice(0, 15) + "...");
    } catch (err) {
        // Never block login or app execution on push notification errors
        console.warn("[Notifications] Failed to register device token:", err);
    }
}

/**
 * Deregisters the device push token from the backend via DELETE /api/v1/notifications/token.
 * Must be called on logout while the JWT is still valid.
 */
export async function unregisterDeviceToken(): Promise<void> {
    try {
        const jwt = await getToken();
        if (!jwt) {
            console.log("[Notifications] No auth token found; skipping backend token removal.");
            return;
        }

        await removeNotificationToken();
        console.log("[Notifications] Device token removed from backend.");
    } catch (err) {
        // Log error but don't prevent user from logging out locally
        console.warn("[Notifications] Failed to remove device token:", err);
    }
}

/**
 * Initializes a listener for token rotation (standard FCM onNewToken behavior).
 * If FCM issues a new token mid-session, it registers the updated token with the backend.
 *
 * @returns Cleanup function to remove the listener on unmount.
 */
export function initPushTokenRotationListener(): () => void {
    const subscription = Notifications.addPushTokenListener(async (deviceToken) => {
        try {
            console.log("[Notifications] Push token rotated by FCM/APNs:", deviceToken);
            const newToken = deviceToken?.data;

            if (!isValidFcmToken(newToken)) {
                console.warn("[Notifications] Rotated token is invalid (must be 32-4096 chars).");
                return;
            }

            const jwt = await getToken();
            if (!jwt) {
                console.log("[Notifications] User not authenticated during token rotation. Skipping registration.");
                return;
            }

            await registerNotificationToken({ fcmToken: newToken.trim() });
            console.log("[Notifications] Rotated token successfully registered with backend.");
        } catch (err) {
            console.warn("[Notifications] Failed to register rotated token:", err);
        }
    });

    return () => {
        subscription.remove();
    };
}
