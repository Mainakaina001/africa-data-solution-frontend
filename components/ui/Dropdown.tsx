import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export interface DropdownOption {
    label: string;
    value: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value: string | null;
    onSelect: (value: string) => void;
    placeholder?: string;
}

export function Dropdown({ options, value, onSelect, placeholder = 'Select an option' }: DropdownProps) {
    const [visible, setVisible] = useState(false);

    const selectedOption = options.find(o => o.value === value);

    const handleSelect = (val: string) => {
        onSelect(val);
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                activeOpacity={0.8} 
                style={styles.dropdownButton} 
                onPress={() => setVisible(true)}
            >
                <Text style={[styles.buttonText, !selectedOption && styles.placeholderText]}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.dropdownMenu}>
                                <FlatList
                                    data={options}
                                    keyExtractor={item => item.value}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity 
                                            style={[styles.optionItem, item.value === value && styles.selectedOption]} 
                                            onPress={() => handleSelect(item.value)}
                                        >
                                            <Text style={[styles.optionText, item.value === value && styles.selectedOptionText]}>
                                                {item.label}
                                            </Text>
                                            {item.value === value && (
                                                <Ionicons name="checkmark" size={20} color={Colors.primary} />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    buttonText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    placeholderText: {
        color: Colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 20,
    },
    dropdownMenu: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        maxHeight: 300,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    selectedOption: {
        backgroundColor: '#F9F9F9',
    },
    optionText: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
    selectedOptionText: {
        fontWeight: '700',
        color: Colors.primary,
    }
});
