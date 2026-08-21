import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WalletBalanceCardProps {
    balance: string | number;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({ balance }) => {
    const isValuePresent = balance !== undefined && balance !== null && balance !== '';
    const num = isValuePresent ? Number(balance) : NaN;
    const displayBalance = !isNaN(num)
        ? `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'Loading...';

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <Ionicons name="wallet-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.label}>Wallet Balance</Text>
            </View>
            <Text style={styles.balance}>{displayBalance}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FAF5F5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
        marginVertical: 10,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    label: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    balance: {
        fontSize: 18,
        fontWeight: '700',
        color: '#E02D2D', // Reddish color as seen in the screenshot
    },
});
