import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { CustomLoader } from './CustomLoader';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'solid' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    isDisabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = 'solid',
    size = 'md',
    isLoading = false,
    isDisabled = false,
    fullWidth = false,
    style,
}: CustomButtonProps) {
    const isSolid = variant === 'solid';

    // Size mapping
    const sizeStyles = {
        sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
        md: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
        lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
    };

    const currentSize = sizeStyles[size];

    const containerStyle: ViewStyle = {
        borderRadius: 10,
        minHeight: 44,
        width: fullWidth ? '100%' : 'auto',
        overflow: 'hidden',
        opacity: (isDisabled || isLoading) ? 0.5 : 1,
        // Add shadow for solid buttons
        ...(isSolid && {
            shadowColor: Colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        }),
        ...style,
    };

    const buttonContentStyle: ViewStyle = {
        paddingVertical: currentSize.paddingVertical,
        paddingHorizontal: currentSize.paddingHorizontal,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: isSolid ? 0 : 0.8,
        borderColor: isSolid ? 'transparent' : '#E3E3E7',
        borderRadius: 10,
    };

    const textStyle: TextStyle = {
        color: isSolid ? '#FFFFFF' : '#000000',
        fontSize: currentSize.fontSize,
        fontWeight: '600',
        textAlign: 'center',
    };

    return (
        <TouchableOpacity
            style={containerStyle}
            onPress={onPress}
            disabled={isDisabled || isLoading}
            activeOpacity={0.7}
        >
            {isSolid ? (
                <LinearGradient
                    colors={[Colors.primary, Colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={buttonContentStyle}
                >
                    {isLoading && (
                        <CustomLoader
                            size="small"
                            color="#FFFFFF"
                            style={styles.spinner}
                        />
                    )}
                    <Text style={textStyle}>{title}</Text>
                </LinearGradient>
            ) : (
                <TouchableOpacity
                    style={[buttonContentStyle, { backgroundColor: 'transparent' }]}
                    onPress={onPress}
                    disabled={isDisabled || isLoading}
                    activeOpacity={0.7}
                >
                    {isLoading && (
                        <CustomLoader
                            size="small"
                            color="#FFFFFF"
                            style={styles.spinner}
                        />
                    )}
                    <Text style={textStyle}>{title}</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    spinner: {
        marginRight: 8,
    },
});
