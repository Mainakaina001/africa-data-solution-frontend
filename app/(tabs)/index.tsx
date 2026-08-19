import { Colors } from '@/constants/colors';
import { useGetMeQuery, useGetWalletBalanceQuery } from '@/store/api/apiSlice';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';

const SERVICES = [
  { icon: 'wifi-outline', label: 'Data', type: 'data' },
  { icon: 'call-outline', label: 'Airtime', type: 'airtime' },
  { icon: 'tv-outline', label: 'Cable TV', type: 'cable' },
  { icon: 'flash-outline', label: 'Electricity', type: 'electricity' },
  { icon: 'school-outline', label: 'Edu Pins', type: 'education' },
  { icon: 'chatbubble-outline', label: 'Bulk SMS', type: 'bulk-sms' },
  { icon: 'key-outline', label: 'Recharge Pin', type: 'recharge-pin' },
  { icon: 'repeat-outline', label: 'Airtime Swap', type: 'airtime-swap' },
  { icon: 'gift-outline', label: 'Smile', type: 'smile' },
  { icon: 'briefcase-outline', label: 'NIN', type: 'NIN' },
  { icon: 'shield-checkmark-outline', label: 'BVN', type: 'BVN' }
]

export default function Dashboard() {
  useFocusEffect(
    useCallback(() => {
      ScreenCapture.preventScreenCaptureAsync();
      return () => {
        ScreenCapture.allowScreenCaptureAsync();
      };
    }, [])
  );

  const [balanceVisible, setBalanceVisible] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const {
    data: meData,
    refetch: refetchMe,
    isFetching: isFetchingMe,
  } = useGetMeQuery();
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance, isFetching: isFetchingBalance } = useGetWalletBalanceQuery(
    user ? { user: { id: user.id, email: user.email, phone: user.phone, role: user.role ?? 'USER' } } : undefined
  );

  const onRefresh = useCallback(() => {
    refetchBalance();
    refetchMe();
  }, [refetchBalance, refetchMe]);

  const refreshing = isFetchingBalance || isFetchingMe;

  // Full profile from /auth/me (includes wallet + virtualAccount)
  const meUser = meData?.data;

  // Balance: prefer /wallet/balance endpoint; fall back to /auth/me wallet
  const balance = balanceData?.data?.balance ?? meUser?.wallet?.balance ?? null;
  const currency = balanceData?.data?.currency ?? meUser?.wallet?.currency ?? 'NGN';
  const formattedBalance = balance !== null
    ? `₦${Number(balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    : '₦0.00';

  // Virtual account from /auth/me
  const virtualAccount = meUser?.virtualAccount ?? meUser?.virtualAccounts?.[0];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={[Colors.primary, Colors.primary]} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../../assets/images/datalog.png')}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.hello}>Hello, {meUser?.firstName ?? user?.firstName ?? 'User'} 👋</Text>
              <Text style={styles.welcome}>Welcome back!</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <View style={styles.balanceRow}>
            {balanceLoading ? (
              <Text style={styles.balance}>Loading...</Text>
            ) : balanceVisible ? (
              <Text style={styles.balance}>{formattedBalance}</Text>
            ) : (
              <Text style={styles.balance}>₦******</Text>
            )}
            <TouchableOpacity onPress={() => setBalanceVisible((v) => !v)}>
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
          {/* Live balance sub-line */}
          {balanceVisible && balance !== null && (
            <Text style={styles.balanceSub}>{currency} • Wallet Balance</Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <ActionButton
            icon="wallet-outline"
            label="Fund Wallet"
            onPress={() => router.push('/fundingwallet')}
          />
          <ActionButton
            icon="time-outline"
            label="History"
            onPress={() => router.push('/(tabs)/walletHistory')}
          />
          <ActionButton icon="people-outline" label="Referrals" />
        </View>
      </LinearGradient>

      {/* Virtual Account Notice */}
      <TouchableOpacity style={styles.notice} onPress={() => router.push('/virtualAccount')}>
        <Text style={styles.noticeText}>
          Click here to Create/Update your virtual account as required by CBN
        </Text>
      </TouchableOpacity>

      {/* Bank Card */}
      <View style={styles.bankCard}>
        <Text style={styles.bankName}>{virtualAccount?.bankName ?? '—'}</Text>
        <Text style={styles.accountName}>{virtualAccount?.accountName ?? '—'}</Text>
        <View style={styles.accountRow}>
          <Text style={styles.accountNumber}>{virtualAccount?.accountNumber ?? '0000000000'}</Text>
          <TouchableOpacity>
            <Ionicons name="copy-outline" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Services */}
      <View style={styles.services}>
        {SERVICES.map((item) => (
          <TouchableOpacity key={item.label}
            activeOpacity={0.7}
            style={styles.serviceWrapper}
            onPress={() => router.push({
              pathname: "/services/[type]",
              params: { type: item.type }
            })}>
            <Service icon={item.icon} label={item.label} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Transactions */}
      <View style={styles.recentHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/walletHistory')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="receipt-outline" size={40} color="#aaa" />
        <Text style={styles.emptyText}>No transactions yet</Text>
      </View>
    </ScrollView>
  );
}

/* Reusable components */
function ActionButton({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={18} color={Colors.textPrimary} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Service({ icon, label }: any) {
  return (
    <View style={styles.service}>
      <View style={styles.serviceIconBg}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <Text style={styles.serviceText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    marginTop: 10,
  },
  avatarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: Colors.background,
  },
  hello: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600'
  },
  welcome: {
    color: Colors.textPrimary,
    fontSize: 14
  },
  balanceContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  balanceLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  balance: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  balanceSub: {
    marginTop: 4,
    color: `${Colors.textPrimary}bb`,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20
  },
  actionBtn: {
    flex: 1,
    backgroundColor: `${Colors.textPrimary}22`,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: Colors.textPrimary,
    fontWeight: '500',
    fontSize: 12,
  },
  notice: {
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 14,
    borderRadius: 10,
  },
  noticeText: {
    color: Colors.textPrimary,
    fontSize: 13
  },
  bankCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
  },
  bankName: {
    color: Colors.textPrimary,
    fontWeight: '600'
  },
  accountName: {
    color: Colors.textPrimary,
    marginTop: 6
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  accountNumber: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700'
  },
  services: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 20,
  },
  serviceWrapper: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 22,
  },
  service: {
    alignItems: 'center',
  },
  serviceIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${Colors.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    marginVertical: 32,
    gap: 8,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
