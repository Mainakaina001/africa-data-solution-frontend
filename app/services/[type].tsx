import { Plan, PlanGrid } from '@/components/PlanGrid';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/input';
import { WalletBalanceCard } from '@/components/WalletBalanceCard';
import { Colors } from '@/constants/colors';
import { useWalletBalance } from '@/hooks/useWallet';
import {
    useGetAirtimeNetworksQuery,
    useGetDataPlansByNetworkQuery,
    useGetEducationProvidersQuery,
    useGetElectricityProvidersQuery,
    useGetServiceVariationsQuery,
    useGetTvProvidersQuery,
    useGetWalletBalanceQuery,
    useVerifyJambProfileMutation,
    useVerifyMeterNumberMutation,
    useVerifySmartcardMutation
} from '@/store/api/apiSlice';
import { useAppDispatch } from '@/store/hooks'; // VULN-004
import { ServiceType, setPendingTransaction } from '@/store/slices/pendingTransactionSlice'; // VULN-004
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';


export interface NetworkProvider {
    id: string;
    name: string;
    logo: ImageSourcePropType;
    color: string;
}


const NETWORK_ASSETS: Record<string, { logo: ImageSourcePropType; color: string }> = {
    mtn: {
        logo: require('../../assets/images/mtn.png'),
        color: '#FFCC00',
    },
    airtel: {
        logo: require('../../assets/images/airtel.png'),
        color: '#E30613',
    },
    etisalat: {
        logo: require('../../assets/images/9mobiles.png'),
        color: '#00A86B',
    },
    glo: {
        logo: require('../../assets/images/glo.png'),
        color: '#009A44',
    },
};

const DEFAULT_NETWORK_ASSET = {
    logo: require('../../assets/images/datalog.png'),
    color: '#333333',
};

const DATA_TYPES_OPTIONS = [
    { label: 'All Types', value: 'ALL' },
    { label: 'SME', value: 'SME' },
    { label: 'Gifting', value: 'Gifting' },
    { label: 'Corporate Gifting', value: 'Corporate' },
    { label: 'Data Coupons', value: 'Coupon' },
];

// ─── Provider selector with real logos ──

function NetworkProviderSelector({
    providers,
    selectedId,
    onSelect,
}: {
    providers: NetworkProvider[];
    selectedId?: string;
    onSelect: (p: NetworkProvider) => void;
}) {
    return (
        <View style={providerStyles.row}>
            {providers.map((p) => {
                const selected = p.id === selectedId;
                return (
                    <TouchableOpacity
                        key={p.id}
                        onPress={() => onSelect(p)}
                        style={[
                            providerStyles.item,
                            selected && { borderColor: p.color, borderWidth: 2.5 },
                        ]}
                        activeOpacity={0.7}
                    >
                        <Image source={p.logo} style={providerStyles.logo} resizeMode="contain" />
                        <Text style={[providerStyles.name, selected && { color: p.color, fontWeight: '700' }]}>
                            {p.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const providerStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5F5F7',
        borderRadius: 14,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    logo: {
        width: 40,
        height: 40,
        marginBottom: 6,
    },
    name: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '500',
        textAlign: 'center',
    },
});

// ─── Selected provider header banner ─────────────────────────────────────────

function SelectedProviderBanner({ provider }: { provider: NetworkProvider }) {
    return (
        <View style={[bannerStyles.wrap, { borderColor: provider.color }]}>
            <Image source={provider.logo} style={bannerStyles.logo} resizeMode="contain" />
            <View>
                <Text style={bannerStyles.label}>Selected Network</Text>
                <Text style={[bannerStyles.name, { color: provider.color }]}>{provider.name}</Text>
            </View>
        </View>
    );
}

const bannerStyles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        backgroundColor: '#fff',
        marginVertical: 8,
    },
    logo: {
        width: 48,
        height: 48,
    },
    label: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
    },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ServiceScreen() {
    const { type } = useLocalSearchParams<{ type: string }>();
    const { balance: walletBalance, numBalance: currentBalance } = useWalletBalance();
    const dispatch = useAppDispatch(); // VULN-004

    const [selectedProvider, setSelectedProvider] = useState<NetworkProvider | null>(null);
    const [selectedDataType, setSelectedDataType] = useState<string>('ALL');
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');

    // Static network list for data — always visible, plans fetched on selection
    const STATIC_DATA_NETWORKS: NetworkProvider[] = [
        { id: 'mtn',      name: 'MTN',     logo: NETWORK_ASSETS.mtn.logo,      color: NETWORK_ASSETS.mtn.color },
        { id: 'airtel',   name: 'Airtel',  logo: NETWORK_ASSETS.airtel.logo,   color: NETWORK_ASSETS.airtel.color },
        { id: 'glo',      name: 'Glo',     logo: NETWORK_ASSETS.glo.logo,      color: NETWORK_ASSETS.glo.color },
        { id: 'etisalat', name: '9mobile', logo: NETWORK_ASSETS.etisalat.logo, color: NETWORK_ASSETS.etisalat.color },
    ];

    // Fetch plans for the selected network from the real /data/plans?network= endpoint
    const { data: networkDataPlansResponse, isLoading: plansLoading } = useGetDataPlansByNetworkQuery(
        selectedProvider?.id ?? '',
        { skip: type !== 'data' || !selectedProvider }
    );
    const networkDataPlans = networkDataPlansResponse?.data ?? [];

    // Fetch Airtime Networks dynamically
    const { data: airtimeNetworksResponse, isLoading: airtimeNetworksLoading } = useGetAirtimeNetworksQuery(undefined, {
        skip: type !== 'airtime'
    });

    const { data: electricityProvidersResponse, isLoading: electricityLoading } = useGetElectricityProvidersQuery(undefined, {
        skip: type !== 'electricity'
    });

    const [verifyMeter, { isLoading: isVerifyingMeter }] = useVerifyMeterNumberMutation();

    const { data: tvProvidersResponse, isLoading: tvLoading } = useGetTvProvidersQuery(undefined, {
        skip: type !== 'cable'
    });

    const { data: educationProvidersResponse, isLoading: educationLoading } = useGetEducationProvidersQuery(undefined, {
        skip: type !== 'education'
    });

    // Dynamically map airtime networks from API to local assets
    const airtimeNetworks: NetworkProvider[] = React.useMemo(() => {
        const rawNetworks = airtimeNetworksResponse?.data || [];
        return rawNetworks.map(net => {
            const asset = NETWORK_ASSETS[net.id.toLowerCase()] || DEFAULT_NETWORK_ASSET;
            return {
                id: net.id,
                name: net.name,
                logo: asset.logo,
                color: asset.color,
            };
        });
    }, [airtimeNetworksResponse]);

    // Electricity providers: { data: { providers: [{id, name}] } }
    const electricityProviders: any[] = electricityProvidersResponse?.data?.providers ?? [];

    // TV providers: { data: { providers: [{id, name}] } }
    const tvProviders: any[] = tvProvidersResponse?.data?.providers ?? [];

    // Education providers: { data: { providers: [{id, name}] } }
    const educationProviders: any[] = educationProvidersResponse?.data?.providers ?? [];

    // Electricity/TV State
    const [selectedElecProvider, setSelectedElecProvider] = useState<any | null>(null);
    const [selectedTvProvider, setSelectedTvProvider] = useState<any | null>(null);
    const [selectedVariation, setSelectedVariation] = useState<any | null>(null);
    const [meterNumber, setMeterNumber] = useState('');
    const [meterVerifiedData, setMeterVerifiedData] = useState<any | null>(null);

    const [verifySmartcard, { isLoading: isVerifyingSmartcard }] = useVerifySmartcardMutation();

    const [selectedEduProvider, setSelectedEduProvider] = useState<any | null>(null);
    const [jambProfileId, setJambProfileId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [eduVerifiedData, setEduVerifiedData] = useState<any | null>(null);

    const [verifyJamb, { isLoading: isVerifyingJamb }] = useVerifyJambProfileMutation();

    const { data: variationsResponse, isLoading: variationsLoading } = useGetServiceVariationsQuery(
        type === 'electricity' ? (selectedElecProvider?.id ?? '') :
            type === 'cable' ? (selectedTvProvider?.id ?? '') :
                (selectedEduProvider?.id ?? ''),
        {
            skip: (!selectedElecProvider && type === 'electricity') ||
                (!selectedTvProvider && type === 'cable') ||
                (!selectedEduProvider && type === 'education')
        }
    );

    // Variations: { data: { serviceName, serviceID, convenienceFee, variations: [...] } }
    const allVariations: any[] = variationsResponse?.data?.variations ?? [];
    const electricityVariations = type === 'electricity' ? allVariations : [];
    const tvVariations = type === 'cable' ? allVariations : [];
    const genericVariations = type === 'education' ? allVariations : [];

    const uniqueElectricityProviders = React.useMemo(() => {
        const map = new Map();
        electricityProviders.forEach(p => {
            const id = p?.serviceID || p?.id || p?.code;
            const name = p?.name || p?.title;
            if (id && name) {
                map.set(id, { ...p, serviceID: id, name });
            }
        });

        if (!map.has('yola-electric') && !map.has('yedc')) {
            map.set('yola-electric', { serviceID: 'yola-electric', name: 'Yola Electric (YEDC)' });
        }

        return Array.from(map.values());
    }, [electricityProviders]);

    const uniqueTvProviders = React.useMemo(() => {
        const map = new Map();
        tvProviders.forEach(p => {
            const id = p?.serviceID || p?.id || p?.code;
            const name = p?.name || p?.title;
            if (id && name) {
                map.set(id, { ...p, serviceID: id, name });
            }
        });
        return Array.from(map.values());
    }, [tvProviders]);

    const uniqueEduProviders = React.useMemo(() => {
        const map = new Map();
        educationProviders.forEach(p => {
            const id = p?.serviceID || p?.id || p?.code;
            const name = p?.name || p?.title;
            if (id && name) {
                map.set(id, { ...p, serviceID: id, name });
            }
        });
        return Array.from(map.values());
    }, [educationProviders]);

    const uniqueElectricityVariations = React.useMemo(() => {
        const map = new Map();
        electricityVariations.forEach(v => {
            const id = v?.variation_code || v?.id;
            const name = v?.name || v?.title;
            const price = v?.variation_amount || v?.price || '0';
            if (id && name) {
                map.set(id, { ...v, variation_code: id, name, variation_amount: price });
            }
        });
        return Array.from(map.values());
    }, [electricityVariations]);

    // Map and filter plans from the per-network API response
    const availablePlans = React.useMemo(() => {
        if (type !== 'data' || !selectedProvider || networkDataPlans.length === 0) return [];

        let plans = networkDataPlans;
        if (selectedDataType && selectedDataType !== 'ALL') {
            plans = plans.filter(p => {
                const planType = (p.planType || p.name || p.planName || '').toUpperCase();
                if (selectedDataType.toUpperCase() === 'SME') {
                    return !planType.includes('GIFTING') && !planType.includes('CORPORATE') && !planType.includes('COUPON');
                }
                return planType.includes(selectedDataType.toUpperCase());
            });
        }

        return plans.map(p => ({
            id: String(p.id),
            name: p.planName || p.name || p.dataAmount || 'Plan',
            price: p.price ? p.price.toString() : '0',
            validity: p.validity || ''
        }));
    }, [selectedProvider, selectedDataType, networkDataPlans, type]);

    const serviceTitle = type ? type.charAt(0).toUpperCase() + type.slice(1) + ' Service' : 'Service';

    useEffect(() => {
        if (selectedPlan && type !== 'electricity') setAmount(selectedPlan.price);
    }, [selectedPlan, type]);

    useEffect(() => {
        if (selectedVariation && selectedVariation.variation_amount) {
            if (Number(selectedVariation.variation_amount) > 0) {
                setAmount(selectedVariation.variation_amount);
            }
        }
    }, [selectedVariation]);

    // Resets meter verification if the inputs change
    useEffect(() => {
        setMeterVerifiedData(null);
    }, [meterNumber, selectedElecProvider, selectedVariation]);

    const handleVerifyMeter = async () => {
        if (type === 'electricity') {
            if (!selectedElecProvider || !selectedVariation || !meterNumber) return;
            try {
                const res = await verifyMeter({
                    meterNumber,
                    serviceID: selectedElecProvider.serviceID,
                    type: selectedVariation.variation_code
                }).unwrap();
                setMeterVerifiedData(res.data || res);
                Toast.show({ type: 'success', text1: 'Meter Verified', text2: 'Meter verified successfully!' });
            } catch (err: any) {
                const errorMessage = err?.message || err?.data?.message || "Could not verify meter number.";
                Toast.show({ type: 'error', text1: 'Verification Failed', text2: errorMessage });
            }
        } else if (type === 'cable') {
            if (!selectedTvProvider || !meterNumber) return;
            try {
                const res = await verifySmartcard({
                    smartcardNumber: meterNumber,
                    serviceID: selectedTvProvider.serviceID
                }).unwrap();
                setMeterVerifiedData(res.data || res);
                Toast.show({ type: 'success', text1: 'Smartcard Verified', text2: 'Smartcard verified successfully!' });
            } catch (err: any) {
                const errorMessage = err?.message || err?.data?.message || "Could not verify smartcard number.";
                Toast.show({ type: 'error', text1: 'Verification Failed', text2: errorMessage });
            }
        }
    };

    const handleVerifyJamb = async () => {
        if (!selectedEduProvider || !selectedVariation || !jambProfileId) return;
        try {
            const res = await verifyJamb({
                profileId: jambProfileId,
                variationCode: selectedVariation.variation_code
            }).unwrap();
            setEduVerifiedData(res.data || res);
            Toast.show({ type: 'success', text1: 'JAMB Verified', text2: 'JAMB Profile verified successfully!' });
        } catch (err: any) {
            const errorMessage = err?.message || err?.data?.message || "Could not verify JAMB profile.";
            Toast.show({ type: 'error', text1: 'Verification Failed', text2: errorMessage });
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // VULN-004 FIX: No financial data in URL params.
    // The full payload is stored in Redux (pendingTransactionSlice) with an
    // opaque UUID as the navigation key. The confirm screen reads from Redux —
    // no amount, planId, meterNumber, etc. are ever exposed in the URL.
    //
    // VULN-014 FIX: Phone is required for ALL service types — no silent
    // fallback to '08000000000'.
    // ─────────────────────────────────────────────────────────────────────────
    const handleBuyNow = () => {
        const purchaseAmount = Number(amount);
        const cleanPhone = phoneNumber.trim();

        // Phone is mandatory for ALL service types (VULN-014)
        if (!cleanPhone || cleanPhone.length < 10) {
            Toast.show({
                type: 'error',
                text1: 'Phone Number Required',
                text2: 'Please enter a valid phone number to continue.',
            });
            return;
        }

        if (!purchaseAmount || purchaseAmount <= 0) {
            Toast.show({ type: 'error', text1: 'Invalid Amount', text2: 'Please enter a valid amount.' });
            return;
        }

        // UX-only balance pre-check (server enforces atomically — VULN-005 note)
        if (purchaseAmount > currentBalance) {
            Toast.show({
                type: 'info',
                text1: 'Insufficient Balance',
                text2: `Wallet: ₦${currentBalance.toLocaleString()} | Required: ₦${purchaseAmount.toLocaleString()}`,
            });
            return;
        }

        // ── Build display labels ────────────────────────────────────────────
        let displayTarget = cleanPhone;
        if (type === 'electricity' || type === 'cable') displayTarget = meterNumber;
        if (type === 'education' && selectedEduProvider?.serviceID === 'jamb') displayTarget = jambProfileId;

        let displayProvider = selectedProvider?.name ?? '';
        if (type === 'electricity') displayProvider = selectedElecProvider?.name ?? '';
        if (type === 'cable') displayProvider = selectedTvProvider?.name ?? '';
        if (type === 'education') displayProvider = selectedEduProvider?.name ?? '';

        let displayDescription = (type || 'Service') + ' Purchase';
        if (type === 'data' && selectedPlan) displayDescription = selectedPlan.name;
        else if (type === 'electricity') displayDescription = `Electricity - ${selectedElecProvider?.name} (${meterNumber})`;
        else if (type === 'cable') displayDescription = `TV Subscription - ${selectedTvProvider?.name} (${meterNumber})`;
        else if (type === 'education') displayDescription = `Education - ${selectedEduProvider?.name} (${selectedVariation?.name})`;

        // ── Build canonical API payload (stored in Redux, NOT in URL) ───────
        const pendingId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

        const basePayload = {
            id: pendingId,
            type: type as ServiceType,
            displayAmount: amount,
            displayProvider,
            displayTarget,
            displayDescription,
            phone: cleanPhone,
            amount: purchaseAmount,
        };

        if (type === 'airtime') {
            dispatch(setPendingTransaction({
                ...basePayload,
                network: selectedProvider?.id.toLowerCase(),
            }));
        } else if (type === 'data') {
            dispatch(setPendingTransaction({
                ...basePayload,
                dataPlanId: selectedPlan?.id,
            }));
        } else if (type === 'electricity') {
            dispatch(setPendingTransaction({
                ...basePayload,
                meterNumber,
                serviceID: selectedElecProvider?.serviceID,
                variationCode: selectedVariation?.variation_code,
            }));
        } else if (type === 'cable') {
            dispatch(setPendingTransaction({
                ...basePayload,
                smartcardNumber: meterNumber,
                serviceID: selectedTvProvider?.serviceID,
                variationCode: selectedVariation?.variation_code,
                subscriptionType: 'change',
            }));
        } else if (type === 'education') {
            dispatch(setPendingTransaction({
                ...basePayload,
                serviceID: selectedEduProvider?.serviceID,
                variationCode: selectedVariation?.variation_code,
                quantity: Number(quantity),
                profileId: selectedEduProvider?.serviceID === 'jamb' ? jambProfileId : undefined,
            }));
        } else {
            return; // Unsupported service type
        }

        // Navigate with only the opaque ID — zero financial data in URL
        router.push({
            pathname: '/services/confirm',
            params: { id: pendingId },
        });
    };


    const canProceed = (type === 'electricity' || type === 'cable')
        ? !!meterVerifiedData && !!amount && Number(amount) > 0 && !!phoneNumber
        : type === 'education'
            ? (selectedEduProvider?.serviceID === 'jamb' ? !!eduVerifiedData : true) && !!selectedEduProvider && !!selectedVariation && !!amount && Number(amount) > 0 && !!phoneNumber
            : !!selectedProvider && !!phoneNumber && !!amount;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: serviceTitle,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 16 }}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                ),
                headerShown: true,
                headerStyle: { backgroundColor: '#fff' },
            }} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <WalletBalanceCard balance={walletBalance !== null && walletBalance !== undefined ? String(walletBalance) : ""} />

                    {/* Show Network Selector ONLY for Data or Airtime */}
                    {(type === 'data' || type === 'airtime') && (
                        <>
                            <Text style={styles.label}>Select Network</Text>
                            <NetworkProviderSelector
                                providers={type === 'data' ? STATIC_DATA_NETWORKS : airtimeNetworks}
                                selectedId={selectedProvider?.id}
                                onSelect={setSelectedProvider}
                            />

                            {selectedProvider && (
                                <SelectedProviderBanner provider={selectedProvider} />
                            )}

                            {type === 'data' && selectedProvider && (
                                <View style={{ marginTop: 8 }}>
                                    <Text style={styles.label}>Data Type</Text>
                                    <Dropdown
                                        options={DATA_TYPES_OPTIONS}
                                        value={selectedDataType}
                                        onSelect={val => {
                                            setSelectedDataType(val);
                                            setSelectedPlan(null);
                                        }}
                                        placeholder="Select Data Type"
                                    />
                                </View>
                            )}

                            <View style={styles.section}>
                                <Text style={styles.label}>Phone Number</Text>
                                <Input
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    rightElement={
                                        <TouchableOpacity>
                                            <Ionicons name="person-circle-outline" size={24} color={Colors.textSecondary} />
                                        </TouchableOpacity>
                                    }
                                />
                            </View>
                        </>
                    )}

                    {type === 'data' && (
                        <View>
                            {plansLoading ? (
                                <Text style={styles.label}>Loading Plans...</Text>
                            ) : availablePlans.length > 0 ? (
                                <PlanGrid
                                    plans={availablePlans}
                                    selectedId={selectedPlan?.id}
                                    onSelect={setSelectedPlan}
                                />
                            ) : selectedProvider ? (
                                <Text style={[styles.label, { marginBottom: 20 }]}>No plans available for this network.</Text>
                            ) : (
                                <Text style={[styles.label, { marginBottom: 20 }]}>Select a network to view plans.</Text>
                            )}
                        </View>
                    )}

                    {type === 'electricity' && (
                        <>
                            <View style={styles.section}>
                                <Text style={styles.label}>Select Provider</Text>
                                <PlanGrid
                                    plans={uniqueElectricityProviders.map((p: any) => ({
                                        id: String(p.serviceID),
                                        name: p.name,
                                        price: '0',
                                        validity: ''
                                    }))}
                                    selectedId={selectedElecProvider?.serviceID ? String(selectedElecProvider.serviceID) : undefined}
                                    onSelect={(plan: Plan) => {
                                        const provider = uniqueElectricityProviders.find((p: any) => String(p.serviceID) === plan.id);
                                        setSelectedElecProvider(provider);
                                    }}
                                />
                            </View>

                            {selectedElecProvider && (
                                <View style={styles.section}>
                                    <Text style={styles.label}>Meter Type</Text>
                                    <PlanGrid
                                        plans={uniqueElectricityVariations.map((v: any) => ({
                                            id: String(v.variation_code),
                                            name: v.name,
                                            price: v.variation_amount || '0',
                                            validity: ''
                                        }))}
                                        selectedId={selectedVariation?.variation_code ? String(selectedVariation.variation_code) : undefined}
                                        onSelect={(plan: Plan) => {
                                            const variation = uniqueElectricityVariations.find((v: any) => String(v.variation_code) === plan.id);
                                            setSelectedVariation(variation);
                                        }}
                                    />
                                </View>
                            )}

                            {selectedVariation && (
                                <View style={styles.section}>
                                    <Text style={styles.label}>Meter Number</Text>
                                    <Input
                                        placeholder="Enter Meter Number"
                                        value={meterNumber}
                                        onChangeText={setMeterNumber}
                                        keyboardType="numeric"
                                    />

                                    <Button
                                        title={isVerifyingMeter ? "Verifying..." : "Verify Meter"}
                                        onPress={handleVerifyMeter}
                                        style={{ marginTop: 10, backgroundColor: Colors.secondary }}
                                        isDisabled={!meterNumber || isVerifyingMeter}
                                    />
                                </View>
                            )}

                            {meterVerifiedData && (
                                <View style={styles.section}>
                                    <Text style={[styles.label, { color: Colors.primary }]}>
                                        Verified Owner: {meterVerifiedData.Customer_Name || 'Unknown'}
                                    </Text>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <Input
                                        placeholder="Phone Number"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            )}
                        </>
                    )}

                    {type === 'cable' && (
                        <>
                            <View style={styles.section}>
                                <Text style={styles.label}>Select Provider</Text>
                                <PlanGrid
                                    plans={uniqueTvProviders.map((p: any) => ({
                                        id: String(p.serviceID),
                                        name: p.name,
                                        price: '0',
                                        validity: ''
                                    }))}
                                    selectedId={selectedTvProvider?.serviceID ? String(selectedTvProvider.serviceID) : undefined}
                                    onSelect={(plan: Plan) => {
                                        const provider = uniqueTvProviders.find((p: any) => String(p.serviceID) === plan.id);
                                        setSelectedTvProvider(provider);
                                        setAmount('');
                                    }}
                                />
                            </View>

                            {selectedTvProvider && (
                                <View style={styles.section}>
                                    <Text style={styles.label}>Smartcard / IUC Number</Text>
                                    <Input
                                        placeholder="Enter Smartcard or IUC"
                                        value={meterNumber}
                                        onChangeText={setMeterNumber}
                                        keyboardType="number-pad"
                                    />
                                    <Button
                                        title={isVerifyingSmartcard ? "Verifying..." : "Verify Smartcard"}
                                        onPress={handleVerifyMeter}
                                        style={{ marginTop: 10 }}
                                        isDisabled={isVerifyingSmartcard || !meterNumber}
                                    />
                                </View>
                            )}

                            {meterVerifiedData && (
                                <View style={styles.section}>
                                    <Text style={[styles.label, { color: Colors.primary }]}>
                                        Verified Owner: {meterVerifiedData.Customer_Name || meterVerifiedData.name || meterVerifiedData.customerName || 'Unknown'}
                                    </Text>
                                </View>
                            )}

                            {meterVerifiedData && (
                                <View style={styles.section}>
                                    <Text style={styles.label}>Select Package</Text>
                                    <PlanGrid
                                        plans={tvVariations.map((v: any) => ({
                                            id: String(v.variation_code),
                                            name: v.name,
                                            price: v.variation_amount || v.price || '0',
                                            validity: ''
                                        }))}
                                        selectedId={selectedVariation?.variation_code ? String(selectedVariation.variation_code) : undefined}
                                        onSelect={(plan: Plan) => {
                                            const variation = tvVariations.find((v: any) => String(v.variation_code) === plan.id);
                                            setSelectedVariation(variation);
                                        }}
                                    />
                                </View>
                            )}

                            {meterVerifiedData && (
                                <View style={styles.section}>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <Input
                                        placeholder="Phone Number"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            )}
                        </>
                    )}

                    {type === 'education' && (
                        <>
                            <View style={styles.section}>
                                <Text style={styles.label}>Select Provider</Text>
                                <PlanGrid
                                    plans={uniqueEduProviders.map((p: any) => ({
                                        id: String(p.serviceID),
                                        name: p.name,
                                        price: '0',
                                        validity: ''
                                    }))}
                                    selectedId={selectedEduProvider?.serviceID ? String(selectedEduProvider.serviceID) : undefined}
                                    onSelect={(plan: Plan) => {
                                        const provider = uniqueEduProviders.find((p: any) => String(p.serviceID) === plan.id);
                                        setSelectedEduProvider(provider);
                                        setEduVerifiedData(null);
                                        setAmount('');
                                    }}
                                />
                            </View>

                            {selectedEduProvider && (
                                <View style={styles.section}>
                                    <Text style={styles.label}>Select Service</Text>
                                    <PlanGrid
                                        plans={genericVariations.map((v: any) => ({
                                            id: String(v.variation_code),
                                            name: v.name,
                                            price: v.variation_amount || '0',
                                            validity: ''
                                        }))}
                                        selectedId={selectedVariation?.variation_code ? String(selectedVariation.variation_code) : undefined}
                                        onSelect={(plan: Plan) => {
                                            const variation = genericVariations.find((v: any) => String(v.variation_code) === plan.id);
                                            setSelectedVariation(variation);
                                            if (variation?.variation_amount && variation.variation_amount !== "0") {
                                                setAmount(variation.variation_amount);
                                            }
                                        }}
                                    />
                                </View>
                            )}

                            {selectedEduProvider?.serviceID === 'jamb' && selectedVariation && (
                                <View style={styles.section}>
                                    <Text style={styles.label}>JAMB Profile ID</Text>
                                    <Input
                                        placeholder="Enter Profile ID"
                                        value={jambProfileId}
                                        onChangeText={setJambProfileId}
                                    />
                                    <Button
                                        title={isVerifyingJamb ? "Verifying..." : "Verify Profile"}
                                        onPress={handleVerifyJamb}
                                        style={{ marginTop: 10 }}
                                        isDisabled={isVerifyingJamb || !jambProfileId}
                                    />
                                </View>
                            )}

                            {eduVerifiedData && (
                                <View style={styles.section}>
                                    <Text style={[styles.label, { color: Colors.primary }]}>
                                        Verified Candidate: {eduVerifiedData.Customer_Name || 'Unknown'}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.section}>
                                <Text style={styles.label}>Phone Number</Text>
                                <Input
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {selectedEduProvider?.serviceID !== 'jamb' && (
                                <View style={styles.section}>
                                    <Text style={styles.label}>Quantity</Text>
                                    <Input
                                        placeholder="Quantity"
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}
                        </>
                    )}

                    {(type === 'airtime' || type === 'data' || (type === 'electricity' && meterVerifiedData) || (type === 'cable' && meterVerifiedData && selectedVariation) || (type === 'education' && selectedVariation && (selectedEduProvider?.serviceID !== 'jamb' || eduVerifiedData))) && (
                        <View style={styles.section}>
                            <Text style={styles.label}>Amount</Text>
                            <Input
                                placeholder="Amount"
                                value={String(amount)}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                editable={type !== 'data' && !(type === 'electricity' && selectedVariation?.variation_amount && selectedVariation.variation_amount !== "0") && !(type === 'cable')}
                            />
                        </View>
                    )}

                    <Button
                        title="Buy Now"
                        onPress={handleBuyNow}
                        style={styles.buyButton}
                        isDisabled={!canProceed}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 20,
        paddingTop: 60
    },
    scrollContent: {
        padding: 16,
        paddingTop: 30,
        paddingBottom: 40,
    },
    section: {
        marginVertical: 10,
    },
    label: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    buyButton: {
        marginTop: 20,
    },
    pinWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.warning + '18',
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
    },
    pinWarningText: {
        flex: 1,
        fontSize: 13,
        color: Colors.warning,
        fontWeight: '500',
    },
    pinHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        gap: 6,
    },
    pinHintText: {
        fontSize: 13,
        color: Colors.primary,
    },
});