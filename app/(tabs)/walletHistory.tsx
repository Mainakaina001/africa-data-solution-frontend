import { Colors } from '@/constants/colors';
import { Transaction } from '@/services/api';
import { useGetTransactionsQuery } from '@/store/api/apiSlice';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomLoader } from '@/components/ui/CustomLoader';
import * as ScreenCapture from 'expo-screen-capture';

type FilterType = 'ALL' | 'CREDIT' | 'DEBIT';
type FilterStatus = 'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED';

function formatAmount(tx: Transaction) {
    const sign = tx.type === 'CREDIT' ? '+' : '-';
    const amountNum = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
    return `${sign}₦${amountNum.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: Transaction['status'] }) {
    const color = status === 'COMPLETED' ? Colors.success
        : status === 'FAILED' ? Colors.error
            : Colors.warning;
    const bg = status === 'COMPLETED' ? `${Colors.success}18`
        : status === 'FAILED' ? `${Colors.error}18`
            : `${Colors.warning}18`;
    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{status}</Text>
        </View>
    );
}

function TransactionCard({ tx, onPress }: { tx: Transaction; onPress: () => void }) {
    const isCredit = tx.type === 'CREDIT';
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
            <View style={[styles.txIcon, { backgroundColor: isCredit ? `${Colors.success}18` : `${Colors.error}18` }]}>
                <Ionicons
                    name={isCredit ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={isCredit ? Colors.success : Colors.error}
                />
            </View>
            <View style={styles.txDetails}>
                <Text style={styles.txDesc} numberOfLines={1}>{tx.description || 'Transaction'}</Text>
                {/* <Text style={styles.txRef} numberOfLines={1}>{tx.reference}</Text> */}
                <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
            </View>
            <View style={styles.txRight}>
                <Text style={[styles.txAmount, { color: isCredit ? Colors.success : Colors.error }]}>
                    {formatAmount(tx)}
                </Text>
                <StatusBadge status={tx.status} />
            </View>
        </TouchableOpacity>
    );
}

export default function WalletHistory() {
    useFocusEffect(
        useCallback(() => {
            ScreenCapture.preventScreenCaptureAsync();
            return () => {
                ScreenCapture.allowScreenCaptureAsync();
            };
        }, [])
    );

    const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL');

    const { data, isLoading, isFetching, refetch } = useGetTransactionsQuery({
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        limit: 50,
        offset: 0,
    });

    const fetchedTransactions = data?.data?.transactions ?? [];
    const transactions = fetchedTransactions.filter(tx => {
        const matchType = typeFilter === 'ALL' || tx.type === typeFilter;
        const matchStatus = statusFilter === 'ALL' || tx.status === statusFilter;
        return matchType && matchStatus;
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Transaction History</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* Type filter chips */}
            <View style={styles.chipRow}>
                {(['ALL', 'CREDIT', 'DEBIT'] as FilterType[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.chip, typeFilter === f && styles.chipActive]}
                        onPress={() => setTypeFilter(f)}
                    >
                        <Text style={[styles.chipText, typeFilter === f && styles.chipTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Status filter chips */}
            <View style={styles.chipRow}>
                {(['ALL', 'COMPLETED', 'PENDING', 'FAILED'] as FilterStatus[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.chip, statusFilter === f && styles.chipActive]}
                        onPress={() => setStatusFilter(f)}
                    >
                        <Text style={[styles.chipText, statusFilter === f && styles.chipTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            {isLoading ? (
                <View style={styles.centered}>
                    <CustomLoader size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading transactions...</Text>
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    refreshing={isFetching}
                    onRefresh={refetch}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Ionicons name="receipt-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No transactions found</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TransactionCard
                            tx={item}
                            onPress={() => router.push({
                                pathname: '/transactionDetail',
                                params: { reference: item.reference }
                            })}
                        />
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 52,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    chipRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
        backgroundColor: '#fff',
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
    },
    chipActive: {
        backgroundColor: Colors.primary,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    chipTextActive: {
        color: '#fff',
    },
    list: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    txIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    txDetails: {
        flex: 1,
    },
    txDesc: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    txRef: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    txDate: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    txRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    txAmount: {
        fontSize: 15,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    loadingText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 15,
        marginTop: 8,
    },
});