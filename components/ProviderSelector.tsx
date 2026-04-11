import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Provider {
    id: string;
    name: string;
    image: any; // Using local images or URLs
}

interface ProviderSelectorProps {
    providers: Provider[];
    selectedId?: string;
    onSelect: (provider: Provider) => void;
    label?: string;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
    providers,
    selectedId,
    onSelect,
    label = "Select Network"
}) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {providers.map((provider) => (
                    <TouchableOpacity
                        key={provider.id}
                        style={[
                            styles.providerItem,
                            selectedId === provider.id && styles.selectedItem
                        ]}
                        onPress={() => onSelect(provider)}
                    >
                        <View style={styles.imageContainer}>
                            <Image source={provider.image} style={styles.image} resizeMode="contain" />
                            {selectedId === provider.id && (
                                <View style={styles.checkmark}>
                                    <Ionicons name="checkmark-circle" size={16} color="black" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    label: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    scrollContent: {
        gap: 12,
    },
    providerItem: {
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5EA',
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    selectedItem: {
        borderColor: Colors.tint,
        borderWidth: 2,
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '80%',
        height: '80%',
    },
    checkmark: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: 'white',
        borderRadius: 10,
    }
});
