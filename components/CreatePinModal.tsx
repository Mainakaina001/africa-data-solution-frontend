import { Colors } from '@/constants/colors';
import { useCreatePinMutation } from '@/store/api/apiSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setHasPin } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface CreatePinModalProps {
    visible: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
    isDismissable?: boolean;
}

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function CreatePinModal({
    visible,
    onClose,
    onSuccess,
    isDismissable = false,
}: CreatePinModalProps) {
    const [step, setStep] = useState<'create' | 'confirm'>('create');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [createPin, { isLoading }] = useCreatePinMutation();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    const currentPin = step === 'create' ? pin : confirmPin;
    const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

    const handleKey = (key: string) => {
        if (isLoading) return;
        setErrorMessage(null);

        if (key === 'del') {
            setCurrentPin((p) => p.slice(0, -1));
        } else if (key !== '' && currentPin.length < 6) {
            const next = currentPin + key;
            setCurrentPin(next);
            if (next.length === 6) {
                if (step === 'create') {
                    setTimeout(() => {
                        setStep('confirm');
                    }, 250);
                } else {
                    handleSubmit(next);
                }
            }
        }
    };

    const resetFlow = () => {
        setPin('');
        setConfirmPin('');
        setStep('create');
        setErrorMessage(null);
    };

    const handleSubmit = async (confirmedPin: string) => {
        if (pin !== confirmedPin) {
            setErrorMessage('PINs do not match. Please re-enter.');
            Toast.show({
                type: 'error',
                text1: 'PIN Mismatch',
                text2: 'The confirmation PIN did not match. Please try again.',
            });
            setConfirmPin('');
            setStep('create');
            setPin('');
            return;
        }

        if (!user?.id) {
            Toast.show({
                type: 'error',
                text1: 'Session Error',
                text2: 'User session not found. Please re-login.',
            });
            return;
        }

        try {
            const res = await createPin({
                pin: confirmedPin,
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role ?? 'USER',
                },
            }).unwrap();

            // Mark PIN as created in local storage
            await AsyncStorage.setItem(`has_pin_${user.id}`, 'true');
            if (user.email) {
                await AsyncStorage.setItem(`has_pin_${user.email.toLowerCase()}`, 'true');
                await AsyncStorage.removeItem(`needs_pin_${user.email.toLowerCase()}`);
            }
            await AsyncStorage.removeItem(`needs_pin_${user.id}`);

            // Update Redux state
            dispatch(setHasPin(true));

            Toast.show({
                type: 'success',
                text1: 'PIN Created Successfully! 🎉',
                text2: res?.message || 'Your transaction PIN is now active.',
                visibilityTime: 2000,
            });

            resetFlow();
            onSuccess?.();
            onClose?.();
        } catch (err: any) {
            const msg = err?.data?.message || err?.message || 'Failed to create transaction PIN.';
            setErrorMessage(msg);
            Toast.show({
                type: 'error',
                text1: 'Creation Failed',
                text2: msg,
            });
            setConfirmPin('');
            setStep('create');
            setPin('');
        }
    };

    const title = step === 'create' ? 'Create Transaction PIN' : 'Confirm Your PIN';
    const subtitle =
        step === 'create'
            ? 'Set a 6-digit security PIN to authorize all your transactions.'
            : 'Re-enter your 6-digit PIN to confirm.';
    const displayPin = step === 'create' ? pin : confirmPin;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={() => {
                if (isDismissable && onClose) {
                    resetFlow();
                    onClose();
                }
            }}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Top warning badge / close */}
                    <View style={styles.topRow}>
                        <View style={styles.securityBadge}>
                            <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
                            <Text style={styles.securityBadgeText}>Security Setup</Text>
                        </View>
                        {isDismissable && onClose && (
                            <TouchableOpacity
                                style={styles.closeBtn}
                                onPress={() => {
                                    resetFlow();
                                    onClose();
                                }}
                            >
                                <Ionicons name="close" size={20} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Step indicator */}
                    <View style={styles.stepIndicatorContainer}>
                        <View style={[styles.stepBar, step === 'create' && styles.stepBarActive, step === 'confirm' && styles.stepBarDone]} />
                        <View style={[styles.stepBar, step === 'confirm' && styles.stepBarActive]} />
                    </View>

                    {/* Header */}
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {/* Step badge */}
                    <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>
                            {step === 'create' ? 'Step 1 of 2: Set PIN' : 'Step 2 of 2: Confirm PIN'}
                        </Text>
                    </View>

                    {/* PIN Dots */}
                    <View style={styles.dotsRow}>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    displayPin.length > i && styles.dotFilled,
                                    errorMessage && styles.dotError,
                                ]}
                            />
                        ))}
                    </View>

                    {/* Error message or spacing */}
                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : (
                        <View style={styles.placeholderSpace} />
                    )}

                    {/* Keypad or Loading */}
                    {isLoading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={styles.loadingText}>Saving your secure PIN...</Text>
                        </View>
                    ) : (
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
                                        <Ionicons name="backspace-outline" size={24} color={Colors.textPrimary} />
                                    ) : (
                                        <Text style={styles.keyText}>{key}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {step === 'confirm' && !isLoading && (
                        <TouchableOpacity
                            style={styles.backStepBtn}
                            onPress={() => {
                                setStep('create');
                                setConfirmPin('');
                                setErrorMessage(null);
                            }}
                        >
                            <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                            <Text style={styles.backStepText}>Back to change PIN</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 24 : 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    topRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: `${Colors.primary}15`,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    securityBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    closeBtn: {
        padding: 4,
    },
    stepIndicatorContainer: {
        flexDirection: 'row',
        gap: 6,
        width: '100%',
        marginBottom: 16,
    },
    stepBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E5EA',
    },
    stepBarActive: {
        backgroundColor: Colors.primary,
    },
    stepBarDone: {
        backgroundColor: Colors.primary,
        opacity: 0.7,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    stepBadge: {
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 20,
    },
    stepBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 12,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
    },
    dotFilled: {
        backgroundColor: Colors.primary,
    },
    dotError: {
        borderColor: '#FF3B30',
        backgroundColor: '#FF3B30',
    },
    errorText: {
        fontSize: 12,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '500',
    },
    placeholderSpace: {
        height: 16,
        marginBottom: 12,
    },
    loaderContainer: {
        height: 240,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'center',
        gap: 10,
    },
    key: {
        width: 80,
        height: 52,
        borderRadius: 14,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyEmpty: {
        backgroundColor: 'transparent',
    },
    keyText: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    backStepBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 14,
        paddingVertical: 4,
    },
    backStepText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.primary,
    },
});
