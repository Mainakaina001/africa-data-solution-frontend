import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TextInput as RNTextInput, StyleSheet, Text, TextInputProps, TouchableOpacity, View } from 'react-native';

interface CustomInputProps extends TextInputProps {
    label?: string;
    error?: string;
    touched?: boolean;
    showPasswordToggle?: boolean;
    rightElement?: React.ReactNode;
}

export function Input({
    label,
    error,
    touched,
    style,
    onFocus,
    onBlur,
    showPasswordToggle = false,
    secureTextEntry,
    rightElement,
    ...props
}: CustomInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const hasError = touched && error;

    const handleFocus = (e: any) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const isSecure = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputWrapper}>
                <RNTextInput
                    style={[
                        styles.input,
                        isFocused && styles.inputFocused,
                        hasError && styles.inputError,
                        showPasswordToggle && styles.inputWithToggle,
                        style,
                    ]}
                    placeholderTextColor="#999"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={isSecure}
                    {...props}
                />
                {showPasswordToggle ? (
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={togglePasswordVisibility}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye' : 'eye-off'}
                            size={20}
                            color="#666666"
                        />
                    </TouchableOpacity>
                ) : rightElement && (
                    <View style={styles.rightElementContainer}>
                        {rightElement}
                    </View>
                )}
            </View>
            {hasError && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    inputWrapper: {
        position: 'relative',
    },
    input: {
        height: 56,
        borderWidth: 0.8,
        borderColor: '#E3E3E7',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: '#F2F2F3',
        color: '#000',
    },
    inputWithToggle: {
        paddingRight: 50,
    },
    inputFocused: {
        backgroundColor: '#F1F1FE',
    },
    inputError: {
        borderColor: '#FF0000',
    },
    toggleButton: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
    },
    rightElementContainer: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 12,
        color: '#FF0000',
        marginTop: 4,
    },
});
