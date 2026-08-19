import { Colors } from '@/constants/colors';
import { useChangePinMutation } from '@/store/api/apiSlice';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

type Step = 'current' | 'new' | 'confirm';

export default function ChangePin() {
    const [step, setStep] = useState<Step>('current');
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [changePin, { isLoading }] = useChangePinMutation();
    const user = useAppSelector((state) => state.auth.user);

    const stepConfig: Record<Step, { title: string; subtitle: string; pin: string; setPin: (v: string) => void }> = {
        current: {
            title: 'Enter Current PIN',
            subtitle: 'Enter your existing 6-digit transaction PIN',
            pin: currentPin,
            setPin: setCurrentPin,
        },
        new: {
            title: 'Enter New PIN',
            subtitle: 'Choose a new 6-digit transaction PIN',
            pin: newPin,
            setPin: setNewPin,
        },
        confirm: {
            title: 'Confirm New PIN',
            subtitle: 'Re-enter your new PIN to confirm',
            pin: confirmPin,
            setPin: setConfirmPin,
        },
    };

    const config = stepConfig[step];

    const handleKey = (key: string) => {
        if (isLoading) return;
        if (key === 'del') {
            config.setPin(config.pin.slice(0, -1));
        } else if (key !== '' && config.pin.length < 6) {
            const next = config.pin + key;
            config.setPin(next);
            if (next.length === 6) {
                if (step === 'current') setTimeout(() => setStep('new'), 300);
                else if (step === 'new') setTimeout(() => setStep('confirm'), 300);
                else handleSubmit(next);
            }
        }
    };

    const handleSubmit = async (confirmedPin: string) => {
        if (newPin !== confirmedPin) {
        Toast.show({
            type: 'error',
            text1: 'PINs do not match',
            text2: 'Your new PINs do not match. Please try again.',
        });
        setNewPin('');
        setConfirmPin('');
        setStep('new');
        return;
        }
        try {
            if (!user) throw new Error('User session not found. Please log in again.');
            await changePin({
                currentPin,
                newPin,
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role ?? 'USER',
                },
            }).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Transaction PIN changed successfully!',
                visibilityTime: 1500,
                onHide: () => router.back(),
            });
        } catch (err: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err?.data?.message || 'Failed to change PIN. Please try again.',
            });
            setCurrentPin('');
            setNewPin('');
            setConfirmPin('');
            setStep('current');
        }
    };

    const goBack = () => {
        if (step === 'confirm') { setStep('new'); setConfirmPin(''); }
        else if (step === 'new') { setStep('current'); setNewPin(''); }
        else router.back();
    };

    const stepIndex = step === 'current' ? 0 : step === 'new' ? 1 : 2;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack}>
                    <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.iconWrap}>
                <Ionicons name="key" size={40} color={Colors.primary} />
            </View>

            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>

            {/* Step indicators */}
            <View style={styles.steps}>
                {[0, 1, 2].map((i) => (
                    <View key={i} style={[styles.stepDot, i <= stepIndex && styles.stepActive]} />
                ))}
            </View>

            {/* PIN dots */}
            <View style={styles.dotsRow}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <View key={i} style={[styles.dot, config.pin.length > i && styles.dotFilled]} />
                ))}
            </View>

            {/* Keypad */}
            <View style={styles.keypad}>
                {KEYPAD.map((key, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.key, key === '' && styles.keyEmpty]}
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
