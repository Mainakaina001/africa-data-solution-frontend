import { Plan, PlanGrid } from '@/components/PlanGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WalletBalanceCard } from '@/components/WalletBalanceCard';
import { Dropdown } from '@/components/ui/Dropdown';
import { Colors } from '@/constants/colors';
import {
    useGetAirtimeNetworksQuery,
    useGetEducationProvidersQuery,
    useGetElectricityProvidersQuery,
    useGetLiveDataPlansQuery,
    useGetServiceVariationsQuery,
    useGetTvProvidersQuery,
    useGetWalletBalanceQuery,
    useVerifyJambProfileMutation,
    useVerifyMeterNumberMutation,
    useVerifySmartcardMutation
} from '@/store/api/apiSlice';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

// ─── Typed provider with real logo assets ───

interface NetworkProvider {
    id: string;
    name: string;
    logo: ImageSourcePropType;
    color: string;
}

const NETWORK_PROVIDERS: NetworkProvider[] = [
    {
        id: '1',
        name: 'MTN',
        logo: require('../../assets/images/mtn.png'),
        color: '#FFCC00',
    },
    {
        id: '2',
        name: 'Airtel',
        logo: require('../../assets/images/airtel.png'),
        color: '#E30613',
    },
    {
        id: '3',
        name: 'T2',
        logo: require('../../assets/images/9mobiles.png'),
        color: '#00A86B',
    },
    {
        id: '4',
        name: 'Glo',
        logo: require('../../assets/images/glo.png'),
        color: '#009A44',
    },
];

const AIRTIME_QUICK_AMOUNTS: Plan[] = [
    { id: '100', name: '₦100', price: '100', validity: '' },
    { id: '200', name: '₦200', price: '200', validity: '' },
    { id: '500', name: '₦500', price: '500', validity: '' },
    { id: '1000', name: '₦1000', price: '1000', validity: '' },
    { id: '2000', name: '₦2000', price: '2000', validity: '' },
    { id: '2000', name: '₦2000', price: '2000', validity: '' },
    { id: '5000', name: '₦5000', price: '5000', validity: '' },
];

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
    const { data: balanceData } = useGetWalletBalanceQuery();

    const [selectedProvider, setSelectedProvider] = useState<NetworkProvider | null>(null);
    const [selectedDataType, setSelectedDataType] = useState<string>('ALL');
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [amount, setAmount] = useState('');

    const { data: liveDataPlansResponse, isLoading: plansLoading } = useGetLiveDataPlansQuery(undefined, {
        skip: type !== 'data'
    });

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

    const liveDataPlans = liveDataPlansResponse?.data || [];
    const airtimeNetworks = airtimeNetworksResponse?.data?.networks || {};

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
        // Providers return { id } not { serviceID } — use .id directly as the serviceID
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

        // User mentioned YEDC (Yola Electric) is missing. Let's ensure it's available.
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
            // VTPass returns variation_amount as price conditionally
            const price = v?.variation_amount || v?.price || '0';
            if (id && name) {
                map.set(id, { ...v, variation_code: id, name, variation_amount: price });
            }
        });
        return Array.from(map.values());
    }, [electricityVariations]);

    // Filter available plans for the selected provider
    const availablePlans = React.useMemo(() => {
        if (type !== 'data' || !selectedProvider) return [];
        const networkPlans = liveDataPlans.find(p => p.network.toUpperCase() === selectedProvider.name.toUpperCase());
        if (!networkPlans) return [];
        
        let plans = networkPlans.plans;
        if (selectedDataType && selectedDataType !== 'ALL') {
            if (selectedDataType.toUpperCase() === 'SME') {
                // If SME is selected, show every plan that is NOT Gifting, Corporate or Coupon.
                plans = plans.filter(p => {
                    const n = p.name.toUpperCase();
                    return !n.includes('GIFTING') && !n.includes('CORPORATE') && !n.includes('COUPON');
                });
            } else {
                plans = plans.filter(p => p.name.toUpperCase().includes(selectedDataType.toUpperCase()));
            }
        }

        return plans.map(p => ({
            id: String(p.id),
            name: p.name,
            price: p.price ? p.price.toString() : p.telco_price ? p.telco_price.toString() : '0',
            validity: '' // Backend doesn't explicitly return validity, it's inside the name
        }));
    }, [selectedProvider, selectedDataType, liveDataPlans, type]);



    const serviceTitle = type ? type.charAt(0).toUpperCase() + type.slice(1) + ' Service' : 'Service';

    useEffect(() => {
        if (selectedPlan && type !== 'electricity') setAmount(selectedPlan.price);
    }, [selectedPlan, type]);

    useEffect(() => {
        if (selectedVariation && selectedVariation.variation_amount) {
            // Some variations have a fixed price, others don't
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

    const handleBuyNow = () => {
        const currentBalance = Number(balanceData?.data?.balance || 0);
        const purchaseAmount = Number(amount);

        if (purchaseAmount > currentBalance) {
            Toast.show({
                type: 'error',
                text1: 'Insufficient Balance',
                text2: `Wallet: ₦${currentBalance} | Required: ₦${purchaseAmount}`,
            });
            return;
        }

        // The provider ID in NETWORK_PROVIDERS already matches the API network IDs.
        // We also do a dynamic match from the API response as a safety fallback.
        let resolvedNetworkId = selectedProvider?.id;

        if (type === 'airtime' && airtimeNetworks) {
            const match = Object.entries(airtimeNetworks).find(
                ([, name]) => selectedProvider?.name.toLowerCase() === name.toLowerCase()
            );
            if (match) resolvedNetworkId = match[0];
        }

        // Create target payload depending on service type
        let actionPayload: any = {};

        if (type === 'airtime') {
            actionPayload = {
                networkId: Number(resolvedNetworkId),
                amount: Number(amount),
                phoneNumber,
            };
        } else if (type === 'data') {
            actionPayload = {
                dataPlanId: selectedPlan?.id,
                phone: phoneNumber,
            };
        } else if (type === 'electricity') {
            actionPayload = {
                meterNumber,
                serviceID: selectedElecProvider?.serviceID,
                variationCode: selectedVariation?.variation_code,
                amount: Number(amount),
                phone: phoneNumber || '08000000000'
            };
        } else if (type === 'cable') {
            actionPayload = {
                smartcardNumber: meterNumber, // we reused meterNumber variable
                serviceID: selectedTvProvider?.serviceID,
                variationCode: selectedVariation?.variation_code,
                amount: Number(amount),
                phone: phoneNumber || '08000000000',
                subscriptionType: 'change'
            };
        } else if (type === 'education') {
            actionPayload = {
                serviceID: selectedEduProvider?.serviceID,
                variationCode: selectedVariation?.variation_code,
                amount: Number(amount),
                phone: phoneNumber || '08000000000',
                quantity: Number(quantity),
                profileId: selectedEduProvider?.serviceID === 'jamb' ? jambProfileId : undefined
            };
        }

        // Description logic
        let desc = (type || 'Service') + ' Purchase';
        if (type === 'data' && selectedPlan) {
            desc = selectedPlan.name + ' FOR ' + selectedPlan.validity;
        } else if (type === 'electricity') {
            desc = `Electricity - ${selectedElecProvider?.name} (${meterNumber})`;
        } else if (type === 'cable') {
            desc = `TV Subscription - ${selectedTvProvider?.name} (${meterNumber})`;
        } else if (type === 'education') {
            desc = `Education - ${selectedEduProvider?.name} (${selectedVariation?.name})`;
        }

        // Fallback resolve target based on type
        let actionTarget = phoneNumber;
        if (type === 'electricity' || type === 'cable') actionTarget = meterNumber;
        if (type === 'education') actionTarget = selectedEduProvider?.serviceID === 'jamb' ? jambProfileId : phoneNumber;

        let actionProviderName = selectedProvider?.name;
        if (type === 'electricity') actionProviderName = selectedElecProvider?.name;
        if (type === 'cable') actionProviderName = selectedTvProvider?.name;
        if (type === 'education') actionProviderName = selectedEduProvider?.name;

        router.push({
            pathname: '/services/confirm',
            params: {
                type,
                provider: actionProviderName,
                target: actionTarget,
                amount,
                description: desc,
                image: '../../assets/images/datalog.png',
                ...actionPayload
            },
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
                headerShown: true
            }} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <WalletBalanceCard balance={balanceData?.data?.balance?.toString() || ""} />

                    {/* Show Network Selector ONLY for Data or Airtime */}
                    {(type === 'data' || type === 'airtime') && (
                        <>
                            {/* Network provider grid with real logos */}
                            <Text style={styles.label}>Select Network</Text>
                            <NetworkProviderSelector
                                providers={NETWORK_PROVIDERS}
                                selectedId={selectedProvider?.id}
                                onSelect={setSelectedProvider}
                            />

                            {/* Selected provider banner */}
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
                                            setSelectedPlan(null); // reset plan on type change
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
                                        style={[styles.buyButton, { marginTop: 10, backgroundColor: Colors.secondary }]}
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
        marginTop: 20
    },
    scrollContent: {
        padding: 16,
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
    // dropdown: {
    //     height: 50,
    //     backgroundColor: '#F2F2F7',
    //     borderRadius: 8,
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'space-between',
    //     paddingHorizontal: 16,
    // },
    // dropdownText: {
    //     fontSize: 14,
    //     color: Colors.textPrimary,
    //     fontWeight: '500',
    // },
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
