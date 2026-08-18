import SettingSwitch from "@/components/ui/switch";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import {
    getBiometricEnabled,
    setBiometricEnabled,
    authenticateWithBiometrics,
    isBiometricsSupported
} from '@/utils/security';

export default function Security() {
    const [biometric, setBiometric] = useState(false);
    const [walletBalance, setWalletBalance] = useState(false);

    useEffect(() => {
        (async () => {
            const enabled = await getBiometricEnabled();
            setBiometric(enabled);
        })();
    }, []);

    const handleBiometricToggle = async (value: boolean) => {
        if (value) {
            const supported = await isBiometricsSupported();
            if (!supported) {
                Toast.show({
                    type: 'error',
                    text1: 'Biometrics Unavailable',
                    text2: 'Please enable Face ID / Fingerprint in your device settings.',
                });
                return;
            }

            const success = await authenticateWithBiometrics('Confirm biometrics to enable');
            if (success) {
                await setBiometricEnabled(true);
                setBiometric(true);
                Toast.show({
                    type: 'success',
                    text1: 'Biometrics Enabled',
                    text2: 'You can now use biometrics to authenticate.',
                });
            } else {
                setBiometric(false);
            }
        } else {
            await setBiometricEnabled(false);
            setBiometric(false);
            Toast.show({
                type: 'info',
                text1: 'Biometrics Disabled',
            });
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>

                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Security</Text>
            </View>
            <View>
                <SettingItem
                    // onPress={()}
                    icon="keypad-outline"
                    title="Change Password"
                    subtitle="change your account password" />
                <SettingItem
                    onPress={() => router.push('/change-pin')}
                    icon="shield-outline"
                    title="Change Pin"
                    subtitle="change your pin" />
                <SettingItem
                    // onPress={()}
                    icon="shield-outline"
                    title="Reset Pin"
                    subtitle="reset your pin with password" />
                <SettingItem
                    onPress={() => router.push('/create-pin')}
                    icon="lock-closed-outline"
                    title="Add pin"
                    subtitle="Add your 4-digit transaction PIN" />

                <SettingSwitch
                    icon="finger-print"
                    title={"Biometric"}
                    value={biometric}
                    onValueChange={handleBiometricToggle}
                />
                <SettingSwitch icon="wallet"
                    title="Show Wallet Balance"
                    value={walletBalance}
                    onValueChange={setWalletBalance} />
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
        backgroundColor: Colors.background,
        paddingTop: 22

    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 16,
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textPrimary,
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