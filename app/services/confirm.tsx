/**
 * confirm.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * VULN-003 FIX: Transaction PIN is now sent to the server with every payment
 *   call. The server must validate the hashed PIN before executing any
 *   financial operation.
 *
 * VULN-004 FIX: All financial payload is read from the Redux
 *   pendingTransactionSlice (in-memory, not from URL params). The only
 *   thing in the URL is an opaque `id` string.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { PinPad } from '@/components/PinPad';
import { Colors } from '@/constants/colors';
import {
    usePayEducationBillMutation,
    usePayElectricityBillMutation,
    usePayTvSubscriptionMutation,
    usePurchaseAirtimeMutation,
    usePurchaseDataMutation,
} from '@/store/api/apiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearPendingTransaction } from '@/store/slices/pendingTransactionSlice';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ConfirmScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // Only opaque ID in URL
    const dispatch = useAppDispatch();

    // Read the full payload from Redux — NOT from URL params (VULN-004)
    const pending = useAppSelector((state) => state.pendingTransaction.pending);

    const [isPinVisible, setIsPinVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const isCompletedRef = useRef(false);

    const [purchaseAirtime] = usePurchaseAirtimeMutation();
    const [purchaseData] = usePurchaseDataMutation();
    const [payElectricity] = usePayElectricityBillMutation();
    const [payTv] = usePayTvSubscriptionMutation();
    const [payEducation] = usePayEducationBillMutation();

    // Guard: if no pending transaction in Redux (e.g. direct deep link attempt),
    // send the user back immediately — nothing to confirm
    useEffect(() => {
        if (isCompletedRef.current) return;
        if (!pending || pending.id !== id) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Session',
                text2: 'Please start a new transaction.',
            });
            router.replace('/(tabs)');
        }
    }, [pending, id]);

    if (!pending || pending.id !== id) return null;

    // ─────────────────────────────────────────────────────────────────────────
    // VULN-003 FIX: handleConfirm receives the PIN from the modal and SENDS it
    // to the server as part of every payment request. The server validates the
    // hashed PIN before processing the financial operation.
    // ─────────────────────────────────────────────────────────────────────────
    const handleConfirm = async (pin: string) => {
        // Client-side PIN format guard (server validates the value)
        if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
            Toast.show({ type: 'error', text1: 'Invalid PIN', text2: 'Please enter a valid 6-digit PIN.' });
            return;
        }

        setIsProcessing(true);

        try {
            let response: any;
            const { type } = pending;

            if (type === 'airtime') {
                response = await purchaseAirtime({
                    network: pending.network!,
                    amount: pending.amount!,
                    phone: pending.phone!,
                    pin,
                    transactionPin: pin,
                }).unwrap();
            } else if (type === 'data') {
                response = await purchaseData({
                    dataPlanId: pending.dataPlanId!,
                    phone: pending.phone!,
                    pin,
                    transactionPin: pin,
                }).unwrap();
            } else if (type === 'electricity') {
                response = await payElectricity({
                    meterNumber: pending.meterNumber!,
                    serviceID: pending.serviceID!,
                    variationCode: pending.variationCode!,
                    amount: pending.amount!,
                    phone: pending.phone!,
                    pin,
                    transactionPin: pin,
                }).unwrap();
            } else if (type === 'cable') {
                response = await payTv({
                    smartcardNumber: pending.smartcardNumber!,
                    serviceID: pending.serviceID!,
                    variationCode: pending.variationCode!,
                    amount: pending.amount!,
                    phone: pending.phone!,
                    subscriptionType: pending.subscriptionType || 'change',
                    pin,
                    transactionPin: pin,
                }).unwrap();
            } else if (type === 'education') {
                response = await payEducation({
                    serviceID: pending.serviceID!,
                    variationCode: pending.variationCode!,
                    amount: pending.amount!,
                    phone: pending.phone!,
                    quantity: pending.quantity ?? 1,
                    profileId: pending.profileId,
                    pin,
                    transactionPin: pin,
                }).unwrap();
            }

            isCompletedRef.current = true;
            setIsProcessing(false);
            setIsPinVisible(false);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: response?.message || response?.data?.message || 'Transaction successful!',
                visibilityTime: 1500,
                onHide: () => {
                    dispatch(clearPendingTransaction());
                    router.replace('/(tabs)');
                },
            });
        } catch (error: any) {
            setIsProcessing(false);
            // Keep the modal open so the user can retry without restarting the flow.
            // Only close it if it was an auth/session error that requires re-login.

            // RTK Query throws different error shapes:
            //   Server error  → { status: 400|422|500, data: { message: '...' } }
            //   Network error → { status: 'FETCH_ERROR', error: 'Network request failed' }
            //   Parse error   → { status: 'PARSING_ERROR', error: '...', originalStatus: 200 }
            //   Custom throw  → plain Error object with .message
            console.error('[Transaction Error]', JSON.stringify(error));

            const errorMessage =
                error?.data?.message ||
                error?.data?.error ||
                error?.error ||
                error?.message ||
                'Transaction failed. Please try again.';

            Toast.show({ type: 'error', text1: 'Transaction Failed', text2: errorMessage });
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: 'Confirm',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                ),
                headerShown: true,
            }} />

            <View style={styles.cardContainer}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/images/datalog.png')} style={styles.logo} resizeMode="contain" />
                </View>

                <View style={styles.summaryCard}>
                    <DetailRow label="To:" value={pending.displayTarget} />
                    <DetailRow label="Amount:" value={`₦${Number(pending.displayAmount).toLocaleString()}`} />
                    <DetailRow label="Service:" value={pending.displayProvider} />
                    <DetailRow label="Description:" value={pending.displayDescription} />
                </View>
            </View>

            <TouchableOpacity
                style={styles.confirmSection}
                activeOpacity={0.7}
                onPress={() => setIsPinVisible(true)}
            >
                <Text style={styles.confirmText}>Tap to Confirm your Transaction</Text>
                <View style={styles.dotsContainer}>
                    {[1, 2, 3, 4, 5].map(i => <View key={i} style={styles.dot} />)}
                </View>
            </TouchableOpacity>

            <PinPad
                visible={isPinVisible}
                title="Enter Transaction PIN"
                subtitle="Enter your 6-digit PIN to authorise this transaction"
                onComplete={handleConfirm}
                onCancel={() => setIsPinVisible(false)}
                isLoading={isProcessing}
            />
        </View>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 20,
    },
    cardContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 60,
        height: 60,
    },
    summaryCard: {
        width: '100%',
        backgroundColor: '#EDF1F7',
        borderRadius: 12,
        padding: 20,
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    rowLabel: {
        fontSize: 16,
        color: Colors.textSecondary,
        flex: 1,
    },
    rowValue: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
        flex: 2,
        textAlign: 'right',
    },
    confirmSection: {
        marginTop: 60,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 18,
        fontWeight: '500',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#CCC',
    },
});
