import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustomLoader } from './ui/CustomLoader';

interface PinPadProps {
    visible: boolean;
    title?: string;
    subtitle?: string;
    onComplete: (pin: string) => void;
    onCancel: () => void;
    isLoading?: boolean;
    error?: string | null;
}

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export function PinPad({
    visible,
    title = 'Enter PIN',
    subtitle = 'Enter your 4-digit transaction PIN',
    onComplete,
    onCancel,
    isLoading = false,
    error = null,
}: PinPadProps) {
    const [pin, setPin] = useState('');

    // Auto-submit when 4 digits entered
    useEffect(() => {
        if (pin.length === 4) {
            onComplete(pin);
        }
    }, [pin]);

    // Reset pin when modal opens
    useEffect(() => {
        if (visible) setPin('');
    }, [visible]);

    const handleKey = (key: string) => {
        if (isLoading) return;
        if (key === 'del') {
            setPin((p) => p.slice(0, -1));
        } else if (key !== '' && pin.length < 4) {
            setPin((p) => p + key);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.handle} />
                        <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
                            <Ionicons name="close" size={22} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Lock icon */}
                    <View style={styles.iconWrap}>
                        <Ionicons name="lock-closed" size={32} color={Colors.primary} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {/* Dots */}
                    <View style={styles.dotsRow}>
                        {[0, 1, 2, 3].map((i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    pin.length > i && styles.dotFilled,
                                    error && styles.dotError,
                                ]}
                            />
                        ))}
                    </View>

                    {/* Error message */}
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : (
                        <View style={{ height: 20 }} />
                    )}

                    {/* Loader or Keypad */}
                    {isLoading ? (
                        <View style={styles.loader}>
                            <CustomLoader size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.keypad}>
                            {KEYPAD.map((key, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.key,
                                        key === '' && styles.keyEmpty,
                                        key === 'del' && styles.keyDel,
                                    ]}
                                    onPress={() => handleKey(key)}
                                    disabled={key === ''}
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
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: 40,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 12,
        marginBottom: 8,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E5EA',
        borderRadius: 2,
        marginBottom: 8,
    },
    closeBtn: {
        position: 'absolute',
        right: 0,
        top: 14,
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: `${Colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    dot: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
    },
    dotFilled: {
        backgroundColor: Colors.primary,
    },
    dotError: {
        borderColor: Colors.error,
        backgroundColor: Colors.error,
    },
    errorText: {
        fontSize: 13,
        color: Colors.error,
        marginBottom: 8,
        height: 20,
    },
    loader: {
        height: 220,
        justifyContent: 'center',
    },
    keypad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        justifyContent: 'center',
        gap: 12,
        marginTop: 8,
    },
    key: {
        width: 88,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyEmpty: {
        backgroundColor: 'transparent',
    },
    keyDel: {
        backgroundColor: '#F2F2F7',
    },
    keyText: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
});
