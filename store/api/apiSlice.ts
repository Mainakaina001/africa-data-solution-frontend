import {
    AirtimeHistoryResponse,
    AirtimeNetworksResponse,
    AirtimeOrder,
    ApiResponse,
    AuthResponse,
    BillHistoryResponse,
    BillPlan,
    BillProvider,
    BillTransaction,
    ChangePasswordRequest,
    DataOrder,
    DataPlan,
    EducationProvider,
    ElectricityProvider,
    GetBillHistoryParams,
    GetDataOrdersParams,
    GetTransactionsParams,
    LoginRequest,
    NetworkPlans,
    PayBillRequest,
    PayEducationRequest,
    PayElectricityRequest,
    PayTvRequest,
    ProvidersResponse,
    PurchaseAirtimeRequest,
    PurchaseDataRequest,
    RegisterRequest,
    ServiceVariation,
    Transaction,
    TransactionsResponse,
    TvProvider,
    User,
    VariationsResponse,
    VerifyJambRequest,
    VerifyJambResponse,
    VerifyMeterRequest,
    VerifyMeterResponse,
    VerifySmartcardRequest,
    VerifySmartcardResponse,
    VirtualAccount,
    getToken
} from "@/services/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://africa-data-solution-backend.onrender.com/api/v1",
        prepareHeaders: async (headers) => {
            const token = await getToken();
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ["User", "Wallet", "DataOrders"],
    endpoints: (builder) => ({
        // Auth
        register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
            query: (data) => ({
                url: "/auth/register",
                method: "POST",
                body: data,
            }),
        }),
        login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
            query: (data) => ({
                url: "/auth/login",
                method: "POST",
                body: data,
            }),
        }),
        getMe: builder.query<ApiResponse<User>, void>({
            query: () => "/auth/me",
            providesTags: ["User"],
        }),
        // updateProfile: builder.mutation<ApiResponse<User>, UpdateProfileRequest>({
        //     query: (data) => ({
        //         url: "/auth/profile",
        //         method: "PUT",
        //         body: data,
        //     }),
        //     invalidatesTags: ["User"],
        // }),
        changePassword: builder.mutation<ApiResponse<any>, ChangePasswordRequest>({
            query: (data) => ({
                url: "/auth/change-password",
                method: "POST",
                body: data,
            }),
        }),
        createPin: builder.mutation<ApiResponse<any>, { pin: string }>({
            query: (data) => ({
                url: "/auth/create-pin",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["User"],
        }),
        changePin: builder.mutation<ApiResponse<any>, { currentPin: string; newPin: string }>({
            query: (data) => ({
                url: "/auth/change-pin",
                method: "POST",
                body: data,
            }),
        }),

        // Wallet & Virtual Accounts
        getVirtualAccounts: builder.query<ApiResponse<VirtualAccount[]>, void>({
            query: () => "/wallet/virtual-accounts",
            providesTags: ["Wallet"],
        }),
        getWalletBalance: builder.query<ApiResponse<{ balance: number; currency: string }>, void>({
            query: () => "/wallet/balance",
            providesTags: ["Wallet"],
        }),
        getTransactions: builder.query<ApiResponse<TransactionsResponse>, GetTransactionsParams>({
            query: (params) => {
                const parts: string[] = [];
                if (params.type) parts.push(`type=${params.type}`);
                if (params.status) parts.push(`status=${params.status}`);
                if (params.limit !== undefined) parts.push(`limit=${params.limit}`);
                if (params.offset !== undefined) parts.push(`offset=${params.offset}`);
                const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
                return `/wallet/transactions${qs}`;
            },
            providesTags: ["Wallet"],
        }),

        getTransactionByReference: builder.query<ApiResponse<Transaction>, string>({
            query: (reference) => `/wallet/transactions/${reference}`,
        }),

        // Data Plans
        getLiveDataPlans: builder.query<ApiResponse<NetworkPlans[]>, void>({
            query: () => "/data/plans/live",
        }),
        getDataPlans: builder.query<ApiResponse<DataPlan[]>, number | undefined>({
            query: (networkId) => {
                const query = networkId !== undefined ? `?networkId=${networkId}` : "";
                return `/data/plans${query}`;
            },
        }),
        getDataPlanById: builder.query<ApiResponse<DataPlan>, string>({
            query: (id) => `/data/plans/${id}`,
        }),
        purchaseData: builder.mutation<ApiResponse<any>, PurchaseDataRequest>({
            query: (data) => ({
                url: "/data/buy",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Wallet", "DataOrders"],
        }),

        // Data Orders
        getDataOrders: builder.query<ApiResponse<DataOrder[]>, GetDataOrdersParams>({
            query: (params) => {
                const queryParts: string[] = [];
                if (params.status) queryParts.push(`status=${params.status}`);
                if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
                if (params.offset !== undefined) queryParts.push(`offset=${params.offset}`);
                const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : "";
                return `/data/orders${queryString}`;
            },
            providesTags: ["DataOrders"],
        }),
        getDataOrderById: builder.query<ApiResponse<DataOrder>, string>({
            query: (id) => `/data/orders/${id}`,
        }),

        // Airtime
        getAirtimeNetworks: builder.query<ApiResponse<AirtimeNetworksResponse>, void>({
            query: () => "/airtime/networks",
        }),
        getAirtimeHistory: builder.query<ApiResponse<AirtimeHistoryResponse>, { page?: number; limit?: number }>({
            query: (params) => {
                const parts: string[] = [];
                if (params.page !== undefined) parts.push(`page=${params.page}`);
                if (params.limit !== undefined) parts.push(`limit=${params.limit}`);
                const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
                return `/airtime/history${qs}`;
            },
        }),
        getAirtimeOrderByReference: builder.query<ApiResponse<AirtimeOrder>, string>({
            query: (reference) => `/airtime/${reference}`,
        }),
        purchaseAirtime: builder.mutation<ApiResponse<any>, PurchaseAirtimeRequest>({
            query: (data) => ({
                url: "/airtime/purchase",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Wallet"],
        }),

        // Bills
        getBillProviders: builder.query<ApiResponse<BillProvider[]>, string>({
            query: (category) => `/bills/providers?category=${category}`,
        }),
        getBillPlans: builder.query<ApiResponse<BillPlan[]>, string>({
            query: (providerId) => `/bills/plans?providerId=${providerId}`,
        }),
        payBill: builder.mutation<ApiResponse<any>, PayBillRequest>({
            query: (data) => ({
                url: "/bills/pay",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Wallet"],
        }),
        getBillsHistory: builder.query<ApiResponse<BillHistoryResponse>, GetBillHistoryParams>({
            query: (params) => {
                const parts: string[] = [];
                if (params.category) parts.push(`category=${params.category}`);
                if (params.page !== undefined) parts.push(`page=${params.page}`);
                if (params.limit !== undefined) parts.push(`limit=${params.limit}`);
                const qs = parts.length > 0 ? `?${parts.join('&')}` : '';
                return `/bills/history${qs}`;
            },
        }),
        getBillByReference: builder.query<ApiResponse<BillTransaction>, string>({
            query: (reference) => `/bills/${reference}`,
        }),

        // Electricity
        // Response: { data: { providers: [{id, name}] } }
        getElectricityProviders: builder.query<ApiResponse<ProvidersResponse>, void>({
            query: () => "/bills/electricity/providers",
        }),
        // Response: { data: { serviceName, serviceID, convenienceFee, variations: [...] } }
        getServiceVariations: builder.query<ApiResponse<VariationsResponse>, string>({
            query: (serviceID) => `/bills/variations/${serviceID}`,
        }),
        verifyMeterNumber: builder.mutation<ApiResponse<VerifyMeterResponse>, VerifyMeterRequest>({
            query: (data) => ({
                url: "/bills/electricity/verify",
                method: "POST",
                body: data,
            }),
        }),
        payElectricityBill: builder.mutation<ApiResponse<any>, PayElectricityRequest>({
            query: (data) => ({
                url: "/bills/electricity/pay",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Wallet"],
        }),

        // TV
        // Response: { data: { providers: [{id, name}] } }
        getTvProviders: builder.query<ApiResponse<ProvidersResponse>, void>({
            query: () => "/bills/tv/providers",
        }),
        verifySmartcard: builder.mutation<ApiResponse<VerifySmartcardResponse>, VerifySmartcardRequest>({
            query: (data) => ({
                url: "/bills/tv/verify",
                method: "POST",
                body: data,
            }),
        }),
        payTvSubscription: builder.mutation<ApiResponse<any>, PayTvRequest>({
            query: (data) => ({
                url: "/bills/tv/pay",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Wallet"],
        }),
        // Education
        // Response: { data: { providers: [{id, name}] } }
        getEducationProviders: builder.query<ApiResponse<ProvidersResponse>, void>({
            query: () => "/bills/education/providers",
        }),
        verifyJambProfile: builder.mutation<ApiResponse<VerifyJambResponse>, VerifyJambRequest>({
            query: (data) => ({
                url: "/bills/education/verify",
                method: "POST",
                body: data,
            }),
        }),
        payEducationBill: builder.mutation<ApiResponse<any>, PayEducationRequest>({
            query: (data) => ({
                url: "/bills/education/pay",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Wallet"],
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useGetMeQuery,
    // useUpdateProfileMutation,
    useChangePasswordMutation,
    useCreatePinMutation,
    useChangePinMutation,
    useGetVirtualAccountsQuery,
    useGetWalletBalanceQuery,
    useGetTransactionsQuery,
    useGetTransactionByReferenceQuery,
    useGetLiveDataPlansQuery,
    useGetDataPlansQuery,
    useGetDataPlanByIdQuery,
    usePurchaseDataMutation,
    useGetDataOrdersQuery,
    useGetDataOrderByIdQuery,
    useGetAirtimeNetworksQuery,
    useGetAirtimeHistoryQuery,
    useGetAirtimeOrderByReferenceQuery,
    usePurchaseAirtimeMutation,
    useGetBillProvidersQuery,
    useGetBillPlansQuery,
    usePayBillMutation,
    useGetElectricityProvidersQuery,
    useGetServiceVariationsQuery,
    useVerifyMeterNumberMutation,
    usePayElectricityBillMutation,
    useGetTvProvidersQuery,
    useVerifySmartcardMutation,
    usePayTvSubscriptionMutation,
    useGetEducationProvidersQuery,
    useVerifyJambProfileMutation,
    usePayEducationBillMutation,
    useGetBillsHistoryQuery,
    useGetBillByReferenceQuery,
} = apiSlice;
