import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

interface CustomLoaderProps {
    size?: 'small' | 'large' | number;
    color?: string; // Kept for compatibility with ActivityIndicator props, though image has its own color
    style?: ViewStyle | any;
}

export function CustomLoader({ size = 'small', color, style }: CustomLoaderProps) {
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [spinValue]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Map size to pixels
    let sizePx = 20;
    if (typeof size === 'number') {
        sizePx = size;
    } else if (size === 'large') {
        sizePx = 40;
    } else {
        sizePx = 20; // small
    }

    return (
        <Animated.Image
            source={require('../../assets/images/datalog.png')}
            style={[
                {
                    width: sizePx,
                    height: sizePx,
                    transform: [{ rotate: spin }],
                    resizeMode: 'contain',
                },
                style,
            ]}
        />
    );
}
