import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.header2}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>
                        Settings
                    </Text>
                </View>
                <SettingItem
                    onPress={() => router.push("/security")}
                    icon="shield"
                    title="Account Security"
                    subtitle="Change password, Biometric and Wallet balance"
                />
                <SettingItem onPress={() => router.push('/notify')}
                    icon="notifications-outline"
                    title="Notification"
                    subtitle="Push notification and Email notification" />
                <SettingItem
                    onPress={() => router.push('/(tabs)/account')}
                    icon="trash"
                    title="Deactivate/Delete Account"
                    subtitle="Account Deletion" />
            </View>

        </ScrollView>
    )
}

function SettingItem({ icon, title, subtitle, onPress }: any) {
    return (
        <TouchableOpacity style={styles.settingRow} onPress={onPress}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={20} color={Colors.background} />
            </View>

            <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSubtitle}>{subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        padding: 16,
        flex: 1,
        backgroundColor: Colors.background
    },
    header2: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 16,
    },
    header: {

        paddingTop: 22
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 22,
        color: Colors.textPrimary
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },

    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    settingSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
})