import {
    AirtimeHistoryResponse,
    AirtimeNetwork,
    AirtimeOrder,
    ApiResponse,
    AuthResponse,
    BASE_URL,
    BillHistoryResponse,
    BillPlan,
    BillProvider,
    BillTransaction,
    ChangePasswordRequest,
    DataOrder,
    DataOrdersResponse,
    DataPlan,
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
    Transaction,
    TransactionsResponse,
    User,
    VariationsResponse,
    VerifyJambRequest,
    VerifyJambResponse,
    VerifyMeterRequest,
    VerifyMeterResponse,
    VerifySmartcardRequest,
    VerifySmartcardResponse,
    VirtualAccount,
    Wallet,
    WalletBalance,
    getToken,
    refreshAccessToken
} from "@/services/api";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: (() => {
        const rawBaseQuery = fetchBaseQuery({
            baseUrl: BASE_URL,
            prepareHeaders: async (headers) => {
                const token = await getToken();
                if (token) {
                    headers.set("Authorization", `Bearer ${token}`);
                }
                return headers;
            },
        });

        const baseQueryWithIdempotency: typeof rawBaseQuery = async (args, api, extraOptions) => {
            let urlStr = "";
            let methodStr = "";
            if (typeof args === "string") {
                urlStr = args;
            } else if (args && typeof args === "object") {
                urlStr = args.url || "";
                methodStr = args.method || "";
            }

            const isMutating = ["POST", "PUT", "DELETE"].includes(methodStr.toUpperCase());
            if (isMutating && args && typeof args === "object") {
                const randomUUID = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                    const r = (Math.random() * 16) | 0;
                    const v = c === "x" ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
                const cleanEndpoint = urlStr.replace(/\//g, "_");
                const idempotencyKey = `rtk_${cleanEndpoint}_${Date.now()}_${randomUUID}`;

                if (!args.headers) {
                    args.headers = {};
                }

                if (args.headers instanceof Headers) {
                    args.headers.set("Idempotency-Key", idempotencyKey);
                } else if (Array.isArray(args.headers)) {
                    args.headers.push(["Idempotency-Key", idempotencyKey]);
                } else {
                    (args.headers as Record<string, string>)["Idempotency-Key"] = idempotencyKey;
                }
            }

            let result = await rawBaseQuery(args, api, extraOptions);

            const isAuthEndpoint = ["/auth/login", "/auth/register", "/auth/refresh"].some((ep) => urlStr.includes(ep));
            if (result.error && result.error.status === 401 && !isAuthEndpoint) {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    result = await rawBaseQuery(args, api, extraOptions);
                }
            }

            return result;
        };
        return baseQueryWithIdempotency;
    })(),
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
        refreshToken: builder.mutation<ApiResponse<{ accessToken: string; refreshToken: string; refreshExpiresAt: string }>, { refreshToken: string }>({
            query: (data) => ({
                url: "/auth/refresh",
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
        changePassword: builder.mutation<ApiResponse<any>, ChangePasswordRequest & { user: { id: string; email: string; phone: string; role: string } }>({
            query: ({ user, ...body }) => ({
                url: `/auth/change-password?id=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email)}&phone=${encodeURIComponent(user.phone)}&role=${encodeURIComponent(user.role)}`,
                method: "POST",
                body,
            }),
        }),
        createPin: builder.mutation<ApiResponse<any>, { pin: string; user: { id: string; email: string; phone: string; role: string } }>({
            query: ({ pin, user }) => ({
                url: `/auth/create-pin?id=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email)}&phone=${encodeURIComponent(user.phone)}&role=${encodeURIComponent(user.role)}`,
                method: "POST",
                body: { pin },
            }),
            invalidatesTags: ["User"],
        }),
        changePin: builder.mutation<ApiResponse<any>, { currentPin: string; newPin: string; user: { id: string; email: string; phone: string; role: string } }>({
            query: ({ user, currentPin, newPin }) => ({
                url: `/auth/change-pin?id=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email)}&phone=${encodeURIComponent(user.phone)}&role=${encodeURIComponent(user.role)}`,
                method: "POST",
                body: { currentPin, newPin },
            }),
        }),

        // Wallet & Virtual Accounts
        getVirtualAccounts: builder.query<ApiResponse<VirtualAccount[]>, void>({
            query: () => "/wallet/virtual-accounts",
            providesTags: ["Wallet"],
        }),
        getWallet: builder.query<ApiResponse<Wallet>, { user?: { id: string; email: string; phone: string; role: string } } | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.user) {
                    if (params.user.id) {
                        searchParams.append("id", params.user.id);
                        searchParams.append("user.id", params.user.id);
                    }
                    if (params.user.email) {
                        searchParams.append("email", params.user.email);
                        searchParams.append("user.email", params.user.email);
                    }
                    if (params.user.phone) {
                        searchParams.append("phone", params.user.phone);
                        searchParams.append("user.phone", params.user.phone);
                    }
                    if (params.user.role) {
                        searchParams.append("role", params.user.role);
                        searchParams.append("user.role", params.user.role);
                    }
                }
                const qs = searchParams.toString();
                return `/wallet${qs ? `?${qs}` : ""}`;
            },
            providesTags: ["Wallet"],
        }),
        getWalletBalance: builder.query<ApiResponse<WalletBalance>, { user?: { id: string; email: string; phone: string; role: string } } | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.user) {
                    if (params.user.id) {
                        searchParams.append("id", params.user.id);
                        searchParams.append("user.id", params.user.id);
                    }
                    if (params.user.email) {
                        searchParams.append("email", params.user.email);
                        searchParams.append("user.email", params.user.email);
                    }
                    if (params.user.phone) {
                        searchParams.append("phone", params.user.phone);
                        searchParams.append("user.phone", params.user.phone);
                    }
                    if (params.user.role) {
                        searchParams.append("role", params.user.role);
                        searchParams.append("user.role", params.user.role);
                    }
                }
                const qs = searchParams.toString();
                return `/wallet/balance${qs ? `?${qs}` : ""}`;
            },
            providesTags: ["Wallet"],
        }),
        getTransactions: builder.query<ApiResponse<TransactionsResponse>, GetTransactionsParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.user) {
                    if (params.user.id) {
                        searchParams.append("id", params.user.id);
                        searchParams.append("user.id", params.user.id);
                    }
                    if (params.user.email) {
                        searchParams.append("email", params.user.email);
                        searchParams.append("user.email", params.user.email);
                    }
                    if (params.user.phone) {
                        searchParams.append("phone", params.user.phone);
                        searchParams.append("user.phone", params.user.phone);
                    }
                    if (params.user.role) {
                        searchParams.append("role", params.user.role);
                        searchParams.append("user.role", params.user.role);
                    }
                }
                if (params.type) searchParams.append("type", params.type);
                if (params.status) searchParams.append("status", params.status);
                if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
                if (params.offset !== undefined) searchParams.append("offset", String(params.offset));
                const qs = searchParams.toString();
                return `/wallet/transactions${qs ? `?${qs}` : ""}`;
            },
            providesTags: ["Wallet"],
        }),

        getTransactionByReference: builder.query<ApiResponse<Transaction>, { reference: string; user?: { id: string; email: string; phone: string; role: string } } | string>({
            query: (arg) => {
                const reference = typeof arg === "string" ? arg : arg.reference;
                const user = typeof arg === "object" ? arg.user : undefined;
                const searchParams = new URLSearchParams();
                if (user) {
                    if (user.id) {
                        searchParams.append("id", user.id);
                        searchParams.append("user.id", user.id);
                    }
                    if (user.email) {
                        searchParams.append("email", user.email);
                        searchParams.append("user.email", user.email);
                    }
                    if (user.phone) {
                        searchParams.append("phone", user.phone);
                        searchParams.append("user.phone", user.phone);
                    }
                    if (user.role) {
                        searchParams.append("role", user.role);
                        searchParams.append("user.role", user.role);
                    }
                }
                const qs = searchParams.toString();
                return `/wallet/transactions/${reference}${qs ? `?${qs}` : ""}`;
            },
        }),

        // Data Plans
        getLiveDataPlans: builder.query<ApiResponse<NetworkPlans[]>, void>({
            query: () => "/data/plans/live",
        }),
        getDataPlans: builder.query<ApiResponse<DataPlan[]>, number | undefined>({
            query: (networkId) => {
                const searchParams = new URLSearchParams();
                if (networkId !== undefined) searchParams.append("networkId", String(networkId));
                const qs = searchParams.toString();
                return `/data/plans${qs ? `?${qs}` : ""}`;
            },
        }),
        // Real endpoint: /data/plans?network=mtn
        getDataPlansByNetwork: builder.query<ApiResponse<DataPlan[]>, string>({
            query: (network) => `/data/plans?network=${encodeURIComponent(network.toLowerCase())}`,
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
        getDataOrders: builder.query<ApiResponse<DataOrdersResponse>, GetDataOrdersParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                // Required user params
                if (params.user) {
                    if (params.user.id) searchParams.append("id", params.user.id);
                    if (params.user.email) searchParams.append("email", params.user.email);
                    if (params.user.phone) searchParams.append("phone", params.user.phone);
                    if (params.user.role) searchParams.append("role", params.user.role);
                }
                if (params.status) searchParams.append("status", params.status);
                if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
                if (params.offset !== undefined) searchParams.append("offset", String(params.offset));
                const qs = searchParams.toString();
                return `/data/orders${qs ? `?${qs}` : ""}`;
            },
            providesTags: ["DataOrders"],
        }),
        getDataOrderById: builder.query<ApiResponse<DataOrder>, { id: string; user?: { id: string; email: string; phone: string; role: string } } | string>({
            query: (arg) => {
                const id = typeof arg === "string" ? arg : arg.id;
                const user = typeof arg === "object" ? arg.user : undefined;
                const searchParams = new URLSearchParams();
                if (user) {
                    if (user.id) searchParams.append("id", user.id);
                    if (user.email) searchParams.append("email", user.email);
                    if (user.phone) searchParams.append("phone", user.phone);
                    if (user.role) searchParams.append("role", user.role);
                }
                const qs = searchParams.toString();
                return `/data/orders/${id}${qs ? `?${qs}` : ""}`;
            },
        }),

        // Airtime
        getAirtimeNetworks: builder.query<ApiResponse<AirtimeNetwork[]>, void>({
            query: () => "/airtime/networks",
        }),
        getAirtimeHistory: builder.query<ApiResponse<AirtimeHistoryResponse>, { page?: number; limit?: number }>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.page !== undefined) searchParams.append("page", String(params.page));
                if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
                const qs = searchParams.toString();
                return `/airtime/history${qs ? `?${qs}` : ""}`;
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
            query: (category) => {
                const searchParams = new URLSearchParams();
                searchParams.append("category", category);
                return `/bills/providers?${searchParams.toString()}`;
            },
        }),
        getBillPlans: builder.query<ApiResponse<BillPlan[]>, string>({
            query: (providerId) => {
                const searchParams = new URLSearchParams();
                searchParams.append("providerId", providerId);
                return `/bills/plans?${searchParams.toString()}`;
            },
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
                const searchParams = new URLSearchParams();
                if (params.category) searchParams.append("category", params.category);
                if (params.page !== undefined) searchParams.append("page", String(params.page));
                if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
                const qs = searchParams.toString();
                return `/bills/history${qs ? `?${qs}` : ""}`;
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
    useRefreshTokenMutation,
    useGetMeQuery,
    // useUpdateProfileMutation,
    useChangePasswordMutation,
    useCreatePinMutation,
    useChangePinMutation,
    useGetVirtualAccountsQuery,
    useGetWalletQuery,
    useGetWalletBalanceQuery,
    useGetTransactionsQuery,
    useGetTransactionByReferenceQuery,
    useGetLiveDataPlansQuery,
    useGetDataPlansQuery,
    useGetDataPlansByNetworkQuery,
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
