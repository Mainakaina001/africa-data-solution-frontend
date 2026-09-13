import { Colors } from '@/constants/colors';
import { useVirtualAccounts } from '@/hooks/useWallet';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CustomLoader } from '@/components/ui/CustomLoader';
import Toast from 'react-native-toast-message';

export default function VirtualAccount() {
    const { data: response, isLoading } = useVirtualAccounts();
    const accounts = response?.data || [];
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, label: string, fieldKey: string) => {
        try {
            await Clipboard.setStringAsync(text);
            setCopiedField(fieldKey);
            Toast.show({
                type: 'success',
                text1: 'Copied!',
                text2: `${label} copied to clipboard.`,
                visibilityTime: 2000,
            });
            // Reset the copied icon after 2 seconds
            setTimeout(() => setCopiedField(null), 2000);
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Copy Failed',
                text2: 'Could not copy to clipboard.',
            });
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Virtual Account</Text>
                </View>

                <View style={styles.notificationContainer}>
                    <Ionicons name="notifications" size={24} color={Colors.primary} />
                    <Text style={styles.notificationText}>Transfer to any of the account numbers below to fund your wallet</Text>
                </View>

                {isLoading ? (
                    <CustomLoader size="large" color={Colors.primary} style={{ marginTop: 20 }} />
                ) : accounts.length > 0 ? (
                    accounts.map((acc: any, index: number) => (
                        <View key={index} style={styles.accountDetails}>
                            {/* Bank Name */}
                            <CopyRow
                                label="Bank Name"
                                value={acc.bankName}
                                fieldKey={`bank-${index}`}
                                copiedField={copiedField}
                                onCopy={() => copyToClipboard(acc.bankName, 'Bank Name', `bank-${index}`)}
                            />

                            {/* Account Name */}
                            <CopyRow
                                label="Account Name"
                                value={acc.accountName}
                                fieldKey={`name-${index}`}
                                copiedField={copiedField}
                                onCopy={() => copyToClipboard(acc.accountName, 'Account Name', `name-${index}`)}
                            />

                            {/* Account Number — highlighted pill */}
                            <View style={styles.accountNumberRow}>
                                <View>
                                    <Text style={styles.accountNumberLabel}>Account Number</Text>
                                    <Text style={styles.accountNumberValue}>{acc.accountNumber}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[
                                        styles.copyButton,
                                        copiedField === `acct-${index}` && styles.copyButtonSuccess,
                                    ]}
                                    onPress={() =>
                                        copyToClipboard(acc.accountNumber, 'Account Number', `acct-${index}`)
                                    }
                                    activeOpacity={0.7}
                                >
                                    <Ionicons
                                        name={copiedField === `acct-${index}` ? 'checkmark' : 'copy-outline'}
                                        size={16}
                                        color={copiedField === `acct-${index}` ? '#fff' : Colors.primary}
                                    />
                                    <Text
                                        style={[
                                            styles.copyButtonText,
                                            copiedField === `acct-${index}` && styles.copyButtonTextSuccess,
                                        ]}
                                    >
                                        {copiedField === `acct-${index}` ? 'Copied!' : 'Copy'}
                                    </Text>
                                </TouchableOpacity>
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

// Reusable row for copyable fields
function CopyRow({
    label,
    value,
    fieldKey,
    copiedField,
    onCopy,
}: {
    label: string;
    value: string;
    fieldKey: string;
    copiedField: string | null;
    onCopy: () => void;
}) {
    const isCopied = copiedField === fieldKey;
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.rowRight}>
                <Text style={styles.value}>{value}</Text>
                <TouchableOpacity
                    onPress={onCopy}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.6}
                >
                    <Ionicons
                        name={isCopied ? 'checkmark-circle' : 'copy-outline'}
                        size={17}
                        color={isCopied ? Colors.success : Colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
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
    backButton: {
        padding: 6,
        marginRight: 16,
    },
    headerText: {
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
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        maxWidth: '60%',
    },
    label: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        textAlign: 'right',
        flexShrink: 1,
    },
    // Account number gets its own highlighted row
    accountNumberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        backgroundColor: `${Colors.primary}08`,
        borderRadius: 12,
        padding: 14,
    },
    accountNumberLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
        fontWeight: '500',
    },
    accountNumberValue: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.textPrimary,
        letterSpacing: 1.5,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        backgroundColor: '#fff',
    },
    copyButtonSuccess: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
    },
    copyButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.primary,
    },
    copyButtonTextSuccess: {
        color: '#fff',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.textSecondary,
    },
});