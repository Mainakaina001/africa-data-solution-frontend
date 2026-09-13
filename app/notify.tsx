import SettingSwitch from "@/components/ui/switch";
import { Colors } from "@/constants/colors";
import { registerDeviceToken, unregisterDeviceToken } from "@/services/notificationService";
import {
    useTestNotificationMutation,
} from "@/store/api/apiSlice";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function Notify() {
    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushLoading, setPushLoading] = useState(false);
    const [testNotification, { isLoading: testLoading }] = useTestNotificationMutation();

    const handlePushToggle = async (value: boolean) => {
        setPushLoading(true);
        try {
            if (value) {
                await registerDeviceToken();
                setPushEnabled(true);
                Toast.show({
                    type: "success",
                    text1: "Push Notifications Enabled",
                    text2: "You will now receive app alerts.",
                });
            } else {
                await unregisterDeviceToken();
                setPushEnabled(false);
                Toast.show({
                    type: "info",
                    text1: "Push Notifications Disabled",
                });
            }
        } catch {
            Toast.show({ type: "error", text1: "Error", text2: "Could not update notification settings." });
        } finally {
            setPushLoading(false);
        }
    };

    const handleTestNotification = async () => {
        try {
            const result = await testNotification({
                title: "Africa Data Solutions",
                body: "🎉 Your push notifications are working!",
            }).unwrap();

            if (result?.data?.sent) {
                Toast.show({
                    type: "success",
                    text1: "Test Sent!",
                    text2: "Check your notification tray.",
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Test Failed",
                    text2: result?.message || "Could not send test notification.",
                });
            }
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: "Test Failed",
                text2: err?.data?.message || "Make sure push notifications are enabled.",
            });
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Notification Settings</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>PUSH NOTIFICATIONS</Text>
                {pushLoading ? (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator color={Colors.primary} />
                        <Text style={styles.loadingText}>Updating…</Text>
                    </View>
                ) : (
                    <SettingSwitch
                        icon="notifications-outline"
                        title="Push Notifications"
                        subtitle="Receive real-time alerts for transactions and updates"
                        value={pushEnabled}
                        onValueChange={handlePushToggle}
                    />
                )}
            </View>

            {/* <View style={styles.section}>
                <Text style={styles.sectionLabel}>DEVELOPER</Text>
                <TouchableOpacity
                    style={[styles.testBtn, testLoading && styles.testBtnDisabled]}
                    onPress={handleTestNotification}
                    disabled={testLoading}
                    activeOpacity={0.75}
                >
                    {testLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Ionicons name="send" size={18} color="#fff" />
                    )}
                    <Text style={styles.testBtnText}>
                        {testLoading ? "Sending…" : "Send Test Notification"}
                    </Text>
                </TouchableOpacity>
            </View> */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 16,
    },
    headerText: {
        flex: 1,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.textSecondary,
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 4,
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 14,
    },
    loadingText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    testBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
    },
    testBtnDisabled: {
        opacity: 0.6,
    },
    testBtnText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});