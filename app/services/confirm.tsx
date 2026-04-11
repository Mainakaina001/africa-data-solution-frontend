import { TransactionPinModal } from '@/components/TransactionPinModal';
import { Colors } from '@/constants/colors';
import { usePayEducationBillMutation, usePayElectricityBillMutation, usePayTvSubscriptionMutation, usePurchaseAirtimeMutation, usePurchaseDataMutation } from '@/store/api/apiSlice';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ConfirmScreen() {
    const params = useLocalSearchParams();
    const [isPinVisible, setIsPinVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Extract params
    const { type, provider, target, amount, description } = params;

    const [purchaseAirtime] = usePurchaseAirtimeMutation();
    const [purchaseData] = usePurchaseDataMutation();
    const [payElectricity] = usePayElectricityBillMutation();
    const [payTv] = usePayTvSubscriptionMutation();
    const [payEducation] = usePayEducationBillMutation();

    const handleConfirm = async (pin: string) => {
        setIsProcessing(true);

        try {
            if (type === 'airtime' && params.networkId) {
                await purchaseAirtime({
                    networkId: Number(params.networkId),
                    amount: Number(amount),
                    phoneNumber: params.phoneNumber as string
                }).unwrap();
            } else if (type === 'data' && params.dataPlanId) {
                await purchaseData({
                    dataPlanId: String(params.dataPlanId),
                    phone: String(params.phone)
                }).unwrap();
            } else if (type === 'electricity' && params.meterNumber) {
                await payElectricity({
                    meterNumber: params.meterNumber as string,
                    serviceID: params.serviceID as string,
                    variationCode: params.variationCode as string,
                    amount: Number(amount),
                    phone: params.phone as string
                }).unwrap();
            } else if (type === 'cable' && params.smartcardNumber) {
                await payTv({
                    smartcardNumber: params.smartcardNumber as string,
                    serviceID: params.serviceID as string,
                    variationCode: params.variationCode as string,
                    amount: Number(amount),
                    phone: params.phone as string,
                    subscriptionType: params.subscriptionType as string || 'change'
                }).unwrap();
            } else if (type === 'education' && params.serviceID) {
                await payEducation({
                    serviceID: params.serviceID as string,
                    variationCode: params.variationCode as string,
                    amount: Number(amount),
                    phone: params.phone as string,
                    quantity: Number(params.quantity || 1),
                    profileId: params.profileId as string
                }).unwrap();
            } else {
                // Keep simulation for other services like Data/Cable until updated
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            setIsProcessing(false);
            setIsPinVisible(false);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Transaction successful!',
                visibilityTime: 1500,
                onHide: () => router.replace('/(tabs)'),
            });
        } catch (error: any) {
            setIsProcessing(false);
            setIsPinVisible(false);
            const errorMessage = error?.data?.message || error?.message || "Transaction failed";
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: errorMessage,
            });
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: "Confirm",
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                ),
                headerShown: true
            }} />

            <View style={styles.cardContainer}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/images/datalog.png')} style={styles.logo} resizeMode="contain" />
                </View>

                <View style={styles.summaryCard}>
                    <DetailRow label="To:" value={target as string} />
                    <DetailRow label="Amount:" value={`₦${amount}`} />
                    <DetailRow label="Service:" value={provider as string} />
                    <DetailRow label="Description:" value={description as string} />
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

            <TransactionPinModal
                isVisible={isPinVisible}
                onClose={() => setIsPinVisible(false)}
                onConfirm={handleConfirm}
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
