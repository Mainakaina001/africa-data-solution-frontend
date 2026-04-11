import { Colors } from '@/constants/colors';
import { useVirtualAccounts } from '@/hooks/useWallet';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CustomLoader } from '@/components/ui/CustomLoader';

export default function VirtualAccount() {
    const { data: response, isLoading } = useVirtualAccounts();
    const accounts = response?.data || [];

    return (
        <ScrollView style={styles.container}>
            <View>
                {/* header  */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Virtual Account</Text>
                </View>

                <View style={styles.notificationContainer}>
                    <Ionicons name="notifications" size={24} color={Colors.primary} />
                    <Text style={styles.notificationText}>Transfer to any of the account number below to fund your wallet</Text>
                </View>

                {isLoading ? (
                    <CustomLoader size="large" color={Colors.primary} style={{ marginTop: 20 }} />
                ) : accounts.length > 0 ? (
                    accounts.map((acc: any, index: number) => (
                        <View key={index} style={styles.accountDetails}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Bank name</Text>
                                <Text style={styles.value}>{acc.bankName}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Account name</Text>
                                <Text style={styles.value}>{acc.accountName}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Account number</Text>
                                <Text style={styles.value}>{acc.accountNumber}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No virtual accounts found.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 40,
    },
    headerText: {
        marginLeft: 16,
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: '700',
    },
    notificationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: `${Colors.primary}15`,
        padding: 16,
        borderRadius: 12,
    },
    notificationText: {
        marginLeft: 12,
        color: Colors.textPrimary,
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    accountDetails: {
        marginBottom: 16,
        backgroundColor: Colors.accent,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.textSecondary,
    }
});