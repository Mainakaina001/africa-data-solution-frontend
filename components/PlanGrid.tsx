import { Colors } from '@/constants/colors';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Plan {
    id: string;
    name: string;
    price: string;
    validity: string;
}

interface PlanGridProps {
    plans: Plan[];
    selectedId?: string;
    onSelect: (plan: Plan) => void;
}

export const PlanGrid: React.FC<PlanGridProps> = ({ plans, selectedId, onSelect }) => {
    const renderItem = ({ item }: { item: Plan }) => (
        <TouchableOpacity
            style={[
                styles.planCard,
                selectedId === item.id && styles.selectedCard
            ]}
            onPress={() => onSelect(item)}
        >
            <Text style={styles.planName}>{item.name}</Text>
            <View style={styles.priceContainer}>
                <Text style={styles.currency}>₦</Text>
                <Text style={styles.price}>{item.price}</Text>
            </View>
            <Text style={styles.validity}>{item.validity}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={plans}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false}
                columnWrapperStyle={styles.row}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    planCard: {
        width: '31%',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    selectedCard: {
        borderColor: Colors.tint,
        backgroundColor: '#F0F7FF',
        borderWidth: 2,
    },
    planName: {
        fontSize: 11,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    currency: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    validity: {
        fontSize: 10,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});
