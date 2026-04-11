import SettingSwitch from '@/components/ui/switch';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function AccountScreen() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <Text style={styles.header}>Profile</Text>

            {/* Avatar */}
            <View style={styles.avatarWrapper}>
                <Image
                    source={require('../../assets/images/datalog.png')}
                    style={styles.avatar} />
                <TouchableOpacity style={styles.editBtn}>
                    <Ionicons name="pencil" size={16} color={Colors.background} />
                </TouchableOpacity>
            </View>

            {/* Name */}
            <Text style={styles.name}>Umar Isah MK</Text>
            <Text style={styles.username}>Ghabasjr</Text>

            {/* Section */}
            <Text style={styles.section}>General settings</Text>

            <SettingItem
                onPress={() => router.push("/information")}
                icon="person-outline"
                title="Personal Information"
                subtitle="Edit your information" />

            <SettingItem
                onPress={() => router.push("/settings")}
                icon="settings-outline"
                title="Settings"
                subtitle="Account, notifications" />

            <SettingItem
                onPress={() => router.push("/accountLimits")}
                icon="shield-checkmark-outline"
                title="Account Limits"
                subtitle="Upgrade your Africa Data Solutions account" />

            <SettingItem
                icon="people-outline"
                title="My Referral"
                subtitle="Referrals, commissions" />
            <SettingSwitch
                icon='moon-outline'
                title='Dark Mode'
                subtitle='Switch app display to preference'
                value={isDarkMode}
                onValueChange={setIsDarkMode} />
            <SettingItem
                onPress={() => router.push("/support")}
                icon="headset-outline"
                title="Help & Support"
                subtitle="Help or contact our customer service" />
            <SettingItem
                onPress={() => router.push("/legal")}
                icon="document-text-outline"
                title="Legal"
                subtitle="Privacy, Security and Terms of use" />
            <SettingItem
                onPress={() => router.push("/login")}
                icon="log-out-outline"
                title="Log Out"
                subtitle="Sign Out of your account" />
            <SettingItem
                icon="share"
                title="Share App"
                subtitle="share our app and get a token"
            />
        </ScrollView>
    );
}

/* Reusable row */
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
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 20,
    },

    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        marginVertical: 16,
        color: Colors.textPrimary,
    },

    avatarWrapper: {
        alignSelf: 'center',
        position: 'relative',
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.background,
    },
    editBtn: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: Colors.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },

    name: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    username: {
        textAlign: 'center',
        color: Colors.textSecondary,
        marginBottom: 24,
    },

    section: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
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
});
