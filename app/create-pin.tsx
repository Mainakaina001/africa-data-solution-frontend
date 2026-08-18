import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/colors';
import { useCreatePinMutation } from '@/store/api/apiSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function CreatePin() {
    const [step, setStep] = useState<'create' | 'confirm'>('create');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [createPin, { isLoading }] = useCreatePinMutation();

    const currentPin = step === 'create' ? pin : confirmPin;
    const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

    const handleKey = (key: string) => {
        if (key === 'del') {
            setCurrentPin((p) => p.slice(0, -1));
        } else if (key !== '' && currentPin.length < 4) {
            const next = currentPin + key;
            setCurrentPin(next);
            if (next.length === 4) {
                if (step === 'create') {
                    // Move to confirm step after brief delay
                    setTimeout(() => setStep('confirm'), 300);
                } else {
                    handleSubmit(next);
                }
            }
        }
    };

    // VULN-020 FIX: Use the `confirmedPin` function parameter directly —
    // NOT the `pin` state variable, which may be stale due to the 300ms
    // setTimeout between 'create' and 'confirm' steps.
    const handleSubmit = async (confirmedPin: string) => {
        if (pin !== confirmedPin) {
        Toast.show({
            type: 'error',
            text1: 'PINs do not match',
            text2: 'Please try again.',
        });
        setPin('');
        setConfirmPin('');
        setStep('create');
        return;
        }
        try {
            await createPin({ pin: confirmedPin }).unwrap(); // VULN-020: parameter, not state
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Transaction PIN created successfully!',
                visibilityTime: 1500,
                onHide: () => router.back(),
            });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err?.data?.message || 'Failed to create PIN. Please try again.',
            });
            setPin('');
            setConfirmPin('');
            setStep('create');
        }
    };


    const title = step === 'create' ? 'Create Transaction PIN' : 'Confirm PIN';
    const subtitle = step === 'create'
        ? 'Choose a 4-digit PIN to secure your transactions'
        : 'Re-enter your PIN to confirm';
    const displayPin = step === 'create' ? pin : confirmPin;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    if (step === 'confirm') { setStep('create'); setConfirmPin(''); }
                    else router.back();
                }}>
                    <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Icon + Title */}
            <View style={styles.iconWrap}>
                <Ionicons name="shield-checkmark" size={40} color={Colors.primary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            {/* Progress dots */}
            <View style={styles.steps}>
                <View style={[styles.stepDot, step === 'create' && styles.stepActive]} />
                <View style={[styles.stepDot, step === 'confirm' && styles.stepActive]} />
            </View>

            {/* PIN dots */}
            <View style={styles.dotsRow}>
                {[0, 1, 2, 3].map((i) => (
                    <View
                        key={i}
                        style={[styles.dot, displayPin.length > i && styles.dotFilled]}
                    />
                ))}
            </View>

            {/* Keypad */}
            <View style={styles.keypad}>
                {KEYPAD.map((key, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[
                            styles.key,
                            key === '' && styles.keyEmpty,
                        ]}
                        onPress={() => handleKey(key)}
                        disabled={key === '' || isLoading}
                        activeOpacity={key === '' ? 1 : 0.6}
                    >
                        {key === 'del' ? (
                            <Ionicons name="backspace-outline" size={26} color={Colors.textPrimary} />
                        ) : (
                            <Text style={styles.keyText}>{key}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {isLoading && (
                <Button title="Creating PIN..." onPress={() => { }} isLoading isDisabled />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 48,
    },
    header: {
        width: '100%',
        alignSelf: 'flex-start',
        marginBottom: 32,
    },
    iconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${Colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    steps: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    stepDot: {
        width: 30,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5E5EA',
    },
    stepActive: {
        backgroundColor: Colors.primary,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 40,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
    },
    dotFilled: {
        backgroundColor: Colors.primary,
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'center',
        gap: 16,
    },
    key: {
        width: 90,
        height: 68,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyEmpty: {
        backgroundColor: 'transparent',
    },
    keyText: {
        fontSize: 26,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
});
