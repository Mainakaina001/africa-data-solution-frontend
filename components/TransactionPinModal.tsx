import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface TransactionPinModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm: (pin: string) => void;
    isLoading?: boolean;
}

export const TransactionPinModal: React.FC<TransactionPinModalProps> = ({
    isVisible,
    onClose,
    onConfirm,
    isLoading
}) => {
    const [pin, setPin] = useState('');

    const handleConfirm = () => {
        if (pin.length >= 4) {
            onConfirm(pin);
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.content}
                        >
                            <View style={styles.header}>
                                <Text style={styles.title}>Enter Transaction PIN</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.subtitle}>Please enter your 4-digit PIN to authorize this transaction.</Text>

                            <View style={styles.pinContainer}>
                                {[0, 1, 2, 3].map((index) => (
                                    <View key={index} style={[styles.pinBox, pin.length > index && styles.pinBoxFilled]}>
                                        {pin.length > index && <View style={styles.dot} />}
                                    </View>
                                ))}
                                <TextInput
                                    value={pin}
                                    onChangeText={(val) => setPin(val.replace(/[^0-9]/g, '').slice(0, 4))}
                                    keyboardType="number-pad"
                                    secureTextEntry
                                    style={styles.hiddenInput}
                                    autoFocus
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, pin.length < 4 && styles.buttonDisabled]}
                                onPress={handleConfirm}
                                disabled={pin.length < 4 || isLoading}
                            >
                                <Text style={styles.buttonText}>{isLoading ? 'Processing...' : 'Proceed'}</Text>
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 32,
        lineHeight: 20,
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
        position: 'relative',
    },
    pinBox: {
        width: 60,
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinBoxFilled: {
        borderColor: Colors.tint,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.textPrimary,
    },
    hiddenInput: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0,
    },
    button: {
        backgroundColor: Colors.tint,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
