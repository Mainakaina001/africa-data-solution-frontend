import { CustomLoader } from '@/components/ui/CustomLoader';
import { Colors } from '@/constants/colors';
import { useGetBillsHistoryQuery } from '@/store/api/apiSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const CATEGORIES = [
  { label: 'All', value: undefined },
  { label: 'Electricity', value: 'ELECTRICITY' },
  { label: 'TV', value: 'TV' },
  { label: 'Education', value: 'EDUCATION' },
];


export default function TransactionHistory() {
  const [category, setCategory] = useState<'ELECTRICITY' | 'TV' | 'EDUCATION' | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, refetch } = useGetBillsHistoryQuery({
    category,
    page,
    limit: 20,
  });

  const bills = data?.data?.payments || [];
  const pagination = data?.data?.pagination;

  const renderItem = ({ item }: { item: any }) => {
    const statusColor = item.status === 'COMPLETED' ? Colors.success
      : item.status === 'FAILED' ? Colors.error
        : Colors.warning;

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => router.push(`/(tabs)/transaction?reference=${item.reference}`)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${statusColor}15` }]}>
          <Ionicons
            name={item.category === 'ELECTRICITY' ? 'flash' : item.category === 'TV' ? 'tv' : 'school'}
            size={24}
            color={statusColor}
          />
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>₦{item.amount.toLocaleString()}</Text>
          <Text style={[styles.status, { color: statusColor }]}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bill History</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                category === item.value && styles.filterChipActive
              ]}
              onPress={() => {
                setCategory(item.value as any);
                setPage(1);
              }}
            >
              <Text style={[
                styles.filterText,
                category === item.value && styles.filterTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <CustomLoader size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Could not load history</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bills}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isFetching}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
          ListFooterComponent={
            pagination && pagination.pages > 1 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  disabled={page === 1}
                  onPress={() => setPage(p => p - 1)}
                  style={[styles.pageButton, page === 1 && styles.disabledButton]}
                >
                  <Ionicons name="chevron-back" size={20} color={page === 1 ? '#CCC' : Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.pageInfo}>Page {page} of {pagination.pages}</Text>
                <TouchableOpacity
                  disabled={page === pagination.pages}
                  onPress={() => setPage(p => p + 1)}
                  style={[styles.pageButton, page === pagination.pages && styles.disabledButton]}
                >
                  <Ionicons name="chevron-forward" size={20} color={page === pagination.pages ? '#CCC' : Colors.primary} />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingBottom: 12,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  status: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 16,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});