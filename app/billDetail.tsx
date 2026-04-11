import { Colors } from '@/constants/colors';
import { useGetBillByReferenceQuery } from '@/store/api/apiSlice';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomLoader } from '@/components/ui/CustomLoader';

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={[styles.rowValue, mono && styles.mono]} selectable>{value}</Text>
        </View>
    );
}

export default function BillTransactionDetail() {
    const { reference } = useLocalSearchParams<{ reference: string }>();
    const { data, isLoading, isError } = useGetBillByReferenceQuery(reference!, {
        skip: !reference,
    });

    const tx = data?.data;

    const statusColor = tx?.status === 'COMPLETED' ? Colors.success
        : tx?.status === 'FAILED' ? Colors.error
            : Colors.warning;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>Bill Details</Text>
                <View style={{ width: 26 }} />
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <CustomLoader size="large" color={Colors.primary} />
                </View>
            ) : isError || !tx ? (
                <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
                    <Text style={styles.errorText}>Could not load transaction</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Amount Hero */}
                    <View style={styles.amountCard}>
                        <View style={[
                            styles.amountIconWrap,
                            { backgroundColor: `${statusColor}18` }
                        ]}>
                            <Ionicons
                                name={tx.category === 'ELECTRICITY' ? 'flash' : tx.category === 'TV' ? 'tv' : 'school'}
                                size={32}
                                color={statusColor}
                            />
                        </View>
                        <Text style={[
                            styles.amount,
                            { color: Colors.textPrimary }
                        ]}>
                            ₦{tx.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                            <Text style={[styles.statusText, { color: statusColor }]}>{tx.status}</Text>
                        </View>
                    </View>

                    {/* Details Card */}
                    <View style={styles.detailsCard}>
                        <Text style={styles.sectionLabel}>Transaction Info</Text>
                        <Row label="Category" value={tx.category} />
                        <Row label="Provider" value={tx.provider} />
                        <Row label="Customer ID" value={tx.customerID} />
                        <Row label="Description" value={tx.description || '—'} />
                        <Row label="Reference" value={tx.reference} mono />
                        <Row label="Fee" value={`₦${tx.fee.toLocaleString()}`} />
                        <Row label="Total Amount" value={`₦${tx.totalAmount.toLocaleString()}`} />
                        <Row label="Date" value={new Date(tx.createdAt).toLocaleString('en-NG', {
                            day: '2-digit', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                        })} />
                    </View>
                </ScrollView>
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    errorText: {
        color: Colors.textSecondary,
        fontSize: 15,
    },
    content: {
        padding: 16,
        gap: 16,
    },
    amountCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    amountIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    amount: {
        fontSize: 36,
        fontWeight: '800',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F7',
        gap: 16,
    },
    rowLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.textPrimary,
        flex: 2,
        textAlign: 'right',
    },
    mono: {
        fontFamily: 'monospace',
        fontSize: 11,
    },
});
