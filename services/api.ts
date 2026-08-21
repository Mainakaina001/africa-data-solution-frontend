// ─── Secure Token Storage (VULN-001 fix) ───────────────────────────────────
// getToken / saveToken / removeToken now use expo-secure-store (hardware-backed
// AES-256 on Android Keystore / iOS Keychain) instead of plaintext AsyncStorage.
// Import for internal use (apiFetch), re-export for external consumers.
import { getRefreshToken, getToken, removeRefreshToken, removeToken, saveRefreshToken, saveToken } from "./secureToken";
export { getRefreshToken, getToken, removeRefreshToken, removeToken, saveRefreshToken, saveToken };


// ─── Base URL ───
export const BASE_URL = "https://api.africadatasolutions.org/api/v1";

// ─── Auth ───

export interface RegisterRequest {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface Wallet {
    id?: string;
    balance: string | number; // API returns balance as a number or string
    currency: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface WalletBalance {
    balance: string | number;
    currency: string;
}

export interface User {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role?: string;
    isActive?: boolean;
    isVerified?: boolean;
    twoFactorEnabled?: boolean;
    wallet?: Wallet;
    // /auth/me returns a single virtualAccount object
    virtualAccount?: VirtualAccount;
    // kept for backward-compat if any endpoint still returns an array
    virtualAccounts?: VirtualAccount[];
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    // API returns accessToken (not token)
    accessToken: string;
    refreshToken?: string;
    refreshExpiresAt?: string;
    user: User;
    twoFactorRequired?: boolean;
    twoFactorEnabled?: boolean;
}

// ─── Virtual Account ─────

export interface VirtualAccount {
    id?: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    accountReference: string;
    isActive?: boolean;
    createdAt?: string;
}

// ─── Data Plans ────

export interface DataPlan {
    id: string;
    // Real API fields
    planName?: string;
    planCode?: string;
    dataAmount?: string;
    price: number | string;
    validity?: string;
    planType?: string;
    description?: string;
    networkId?: number;
    network: string;
    // Legacy fallbacks
    name?: string;
    telco_price?: number | string;
}

export interface NetworkPlans {
    network: string;
    networkId: number;
    plans: DataPlan[];
}

// ─── Data Orders ───

export interface DataOrder {
    id: string;
    phone: string;
    amount: number;
    reference: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
    failureReason?: string;
    deliveredAt?: string;
    createdAt: string;
    // Legacy / enriched fields (may not always be present)
    network?: string;
    planName?: string;
}

export interface DataOrdersPagination {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export interface DataOrdersResponse {
    items: DataOrder[];
    pagination: DataOrdersPagination;
}

export interface GetDataOrdersParams {
    user?: { id: string; email: string; phone: string; role: string };
    status?: 'PENDING' | 'COMPLETED' | 'FAILED';
    limit?: number;
    offset?: number;
}

// ─── Wallet Transactions ───

export interface TransactionMetadata {
    [key: string]: string | number | boolean | null | undefined;
}

export interface Transaction {
    id: string;
    walletId?: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number | string;
    balanceBefore?: string | number;
    balanceAfter?: string | number;
    reference: string;
    description: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    metadata?: TransactionMetadata;
    createdAt: string;
    updatedAt?: string;
}

export interface TransactionsResponse {
    items?: Transaction[];
    transactions?: Transaction[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface GetTransactionsParams {
    user?: {
        id: string;
        email: string;
        phone: string;
        role: string;
    };
    type?: 'CREDIT' | 'DEBIT';
    status?: 'PENDING' | 'COMPLETED' | 'FAILED';
    limit?: number;
    offset?: number;
}


export interface BillTransaction {
    id: string;
    reference: string;
    amount: number;
    fee: number;
    totalAmount: number;
    category: 'ELECTRICITY' | 'TV' | 'EDUCATION' | string;
    provider: string;
    customerID: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetBillHistoryParams {
    category?: 'ELECTRICITY' | 'TV' | 'EDUCATION';
    page?: number;
    limit?: number;
}

export interface BillHistoryResponse {
    payments: BillTransaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}


export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Token helpers are re-exported from ./secureToken above (VULN-001 fix).
// They use expo-secure-store (Android Keystore / iOS Keychain) instead of
// plaintext AsyncStorage, so they are no longer defined here.

// ─── API Client ──────────────────────────────────────────────────────────────
// VULN-008 FIX: apiFetch now handles HTTP 401 globally.
// When the server returns 401 (token expired / revoked), the app automatically:
//   1. Deletes the token from SecureStore
//   2. Dispatches the Redux logout action
//   3. Redirects the user to /login
// This prevents stale tokens from persisting after a password change or
// server-side session invalidation.
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return null;

        const json = await response.json();
        if (json?.success && json?.data?.accessToken) {
            const newAccessToken = json.data.accessToken;
            await saveToken(newAccessToken);
            if (json.data.refreshToken) {
                await saveRefreshToken(json.data.refreshToken);
            }
            return newAccessToken;
        }
        return null;
    } catch {
        return null;
    }
}

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const token = await getToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    // VULN-013: Add Idempotency-Key header to mutating requests (POST/PUT/DELETE)
    if (options.method && ["POST", "PUT", "DELETE"].includes(options.method.toUpperCase())) {
        const randomUUID = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        headers["Idempotency-Key"] = `api_${endpoint.replace(/\//g, "_")}_${Date.now()}_${randomUUID}`;
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Automatically attempt refresh on 401 (except for login/register/refresh endpoints)
    const isAuthEndpoint = ["/auth/login", "/auth/register", "/auth/refresh"].includes(endpoint);
    if (response.status === 401 && !isAuthEndpoint) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            headers["Authorization"] = `Bearer ${newToken}`;
            response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });
        }
    }

    // Global 401 handler — force logout if still 401 after attempt
    if (response.status === 401 && !isAuthEndpoint) {
        await removeToken();
        await removeRefreshToken();
        // Lazy-import to avoid circular dependency (store → api → store)
        const { store } = await import("../store");
        const { logout } = await import("../store/slices/authSlice");
        store.dispatch(logout());
        const { router } = await import("expo-router");
        router.replace("/login");
        throw new Error("Session expired. Please log in again.");
    }

    const json = await response.json();

    if (!response.ok) {
        throw new Error(
            json?.message || `Request failed with status ${response.status}`
        );
    }

    return json as T;
}


// AUTH

export const registerUser = (
    data: RegisterRequest
): Promise<ApiResponse<AuthResponse>> =>
    apiFetch<ApiResponse<AuthResponse>>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });

/** POST /auth/login */
export const loginUser = (
    data: LoginRequest
): Promise<ApiResponse<AuthResponse>> =>
    apiFetch<ApiResponse<AuthResponse>>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    });

/** GET /auth/me */
export const getMe = (): Promise<ApiResponse<User>> =>
    apiFetch<ApiResponse<User>>("/auth/me");

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export const updateProfile = (data: UpdateProfileRequest): Promise<ApiResponse<User>> =>
    apiFetch<ApiResponse<User>>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
    });

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export const changePassword = (data: ChangePasswordRequest): Promise<ApiResponse<any>> =>
    apiFetch<ApiResponse<any>>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
    });

// VIRTUAL ACCOUNT & WALLET

export const getVirtualAccounts = (): Promise<ApiResponse<VirtualAccount[]>> =>
    apiFetch<ApiResponse<VirtualAccount[]>>("/wallet/virtual-accounts");

export const getWallet = (user?: { id: string; email: string; phone: string; role: string }): Promise<ApiResponse<Wallet>> => {
    const searchParams = new URLSearchParams();
    if (user) {
        if (user.id) { searchParams.append("id", user.id); searchParams.append("user.id", user.id); }
        if (user.email) { searchParams.append("email", user.email); searchParams.append("user.email", user.email); }
        if (user.phone) { searchParams.append("phone", user.phone); searchParams.append("user.phone", user.phone); }
        if (user.role) { searchParams.append("role", user.role); searchParams.append("user.role", user.role); }
    }
    const qs = searchParams.toString();
    return apiFetch<ApiResponse<Wallet>>(`/wallet${qs ? `?${qs}` : ""}`);
};

export const getWalletBalance = (user?: { id: string; email: string; phone: string; role: string }): Promise<ApiResponse<WalletBalance>> => {
    const searchParams = new URLSearchParams();
    if (user) {
        if (user.id) { searchParams.append("id", user.id); searchParams.append("user.id", user.id); }
        if (user.email) { searchParams.append("email", user.email); searchParams.append("user.email", user.email); }
        if (user.phone) { searchParams.append("phone", user.phone); searchParams.append("user.phone", user.phone); }
        if (user.role) { searchParams.append("role", user.role); searchParams.append("user.role", user.role); }
    }
    const qs = searchParams.toString();
    return apiFetch<ApiResponse<WalletBalance>>(`/wallet/balance${qs ? `?${qs}` : ""}`);
};

// DATA PLANS

export interface PurchaseDataRequest {
    dataPlanId: string;
    phone: string;
    transactionPin: string; // VULN-003: PIN validated server-side before processing
}

export const getLiveDataPlans = (): Promise<ApiResponse<NetworkPlans[]>> =>
    apiFetch<ApiResponse<NetworkPlans[]>>("/data/plans/live");

export const getDataOrders = (params: GetDataOrdersParams = {}): Promise<ApiResponse<DataOrder[]>> => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append("status", params.status);
    if (params.limit !== undefined) searchParams.append("limit", String(params.limit));
    if (params.offset !== undefined) searchParams.append("offset", String(params.offset));

    const queryString = searchParams.toString();
    return apiFetch<ApiResponse<DataOrder[]>>(`/data/orders${queryString ? `?${queryString}` : ""}`);
};

export const getDataOrderById = (id: string, user?: { id: string; email: string; phone: string; role: string }): Promise<ApiResponse<DataOrder>> => {
    const searchParams = new URLSearchParams();
    if (user) {
        if (user.id) searchParams.append("id", user.id);
        if (user.email) searchParams.append("email", user.email);
        if (user.phone) searchParams.append("phone", user.phone);
        if (user.role) searchParams.append("role", user.role);
    }
    const queryString = searchParams.toString();
    return apiFetch<ApiResponse<DataOrder>>(`/data/orders/${id}${queryString ? `?${queryString}` : ""}`);
};

/**
 * Get raw SME Plug plans — DEBUG ONLY (VULN-009 fix).
 * Stripped from production builds; only callable in Expo development mode.
 */
export const getRawDataPlans = __DEV__
    ? (): Promise<ApiResponse<unknown>> =>
        apiFetch<ApiResponse<unknown>>("/data/plans/raw")
    : undefined;

export const getDataPlans = (
    networkId?: number
): Promise<ApiResponse<DataPlan[]>> => {
    const searchParams = new URLSearchParams();
    if (networkId !== undefined) searchParams.append("networkId", String(networkId));
    const queryString = searchParams.toString();
    return apiFetch<ApiResponse<DataPlan[]>>(`/data/plans${queryString ? `?${queryString}` : ""}`);
};

export const getDataPlanById = (id: string): Promise<ApiResponse<DataPlan>> =>
    apiFetch<ApiResponse<DataPlan>>(`/data/plans/${id}`);

export const purchaseData = (data: PurchaseDataRequest): Promise<ApiResponse<any>> =>
    apiFetch<ApiResponse<any>>("/data/buy", {
        method: "POST",
        body: JSON.stringify(data),
    });

// ─── Airtime ───

export interface PurchaseAirtimeRequest {
    network: string;
    amount: number;
    phone: string;
    transactionPin: string; // VULN-003: PIN validated server-side before processing
}

export interface AirtimeNetwork {
    id: string;
    name: string;
}

export interface AirtimeNetworksResponse {
    networks: AirtimeNetwork[];
}

export interface AirtimeOrder {
    id?: string;
    reference?: string;
    networkId?: number;
    network?: string;
    phoneNumber?: string;
    amount?: number;
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

export interface AirtimeHistoryResponse {
    orders: AirtimeOrder[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export const purchaseAirtime = (data: PurchaseAirtimeRequest): Promise<ApiResponse<any>> =>
    apiFetch<ApiResponse<any>>("/airtime/purchase", {
        method: "POST",
        body: JSON.stringify(data),
    });

// ─── Bills ───

export interface BillProvider {
    id: string;
    name: string;
    category: string;
}

export interface BillPlan {
    id: string;
    name: string;
    amount: number;
}

export interface PayBillRequest {
    serviceType: string;
    providerId: string;
    customerId: string;
    planId?: string;
    amount?: number;
}

// Actual API shape: /bills/electricity/providers → { data: { providers: [{id, name}] } }
export interface ElectricityProvider {
    id: string;   // used as serviceID
    name: string;
}

// Wrapper returned by /bills/electricity/providers and /bills/tv/providers and /bills/education/providers
export interface ProvidersResponse {
    providers: ElectricityProvider[];
}

export interface ServiceVariation {
    variation_code: string;
    name: string;
    variation_amount: string; // e.g. "1850.00" or "0.00"
    fixedPrice: string;       // "Yes" | "No"
}

// Actual API shape: /bills/variations/{serviceID} → { data: { serviceName, serviceID, convenienceFee, variations: [...] } }
export interface VariationsResponse {
    serviceName: string;
    serviceID: string;
    convenienceFee: string;
    variations: ServiceVariation[];
}

export interface VerifyMeterRequest {
    meterNumber: string;
    serviceID: string;
    type: string; // usually "prepaid" or "postpaid", matching variationCode
}

export interface VerifyMeterResponse {
    Customer_Name: string;
    Meter_Number: string;
    Address: string;
    [key: string]: any; // Catch-all for other vtpass fields
}

export interface PayElectricityRequest {
    meterNumber: string;
    serviceID: string;
    variationCode: string;
    amount: number;
    phone: string;
    transactionPin: string; // VULN-003: PIN validated server-side before processing
}

// Actual API shape: /bills/tv/providers returns { id, name } — no serviceID field
export interface TvProvider {
    id: string;   // e.g. "dstv", "gotv", "startimes" — used as the serviceID for variations
    name: string;
}

export interface VerifySmartcardRequest {
    smartcardNumber: string;
    serviceID: string;
}

export interface VerifySmartcardResponse {
    Customer_Name: string;
    Smartcard_Number: string;
    [key: string]: any;
}

export interface PayTvRequest {
    smartcardNumber: string;
    serviceID: string;
    variationCode: string;
    amount: number;
    phone: string;
    subscriptionType: string; // e.g., 'change'
    transactionPin: string; // VULN-003: PIN validated server-side before processing
}

// Actual API shape mirrors electricity/tv: { data: { providers: [{id, name}] } }
export interface EducationProvider {
    id: string;   // used as serviceID
    name: string;
}

export interface VerifyJambRequest {
    profileId: string;
    variationCode: string;
}

export interface VerifyJambResponse {
    Customer_Name: string;
    [key: string]: any;
}

export interface PayEducationRequest {
    serviceID: string;
    variationCode: string;
    amount: number;
    phone: string;
    quantity: number;
    profileId?: string; // For JAMB
    transactionPin: string; // VULN-003: PIN validated server-side before processing
}

export const getBillProviders = (category: string): Promise<ApiResponse<BillProvider[]>> => {
    const searchParams = new URLSearchParams();
    searchParams.append("category", category);
    return apiFetch<ApiResponse<BillProvider[]>>(`/bills/providers?${searchParams.toString()}`);
};

export const getBillPlans = (providerId: string): Promise<ApiResponse<BillPlan[]>> => {
    const searchParams = new URLSearchParams();
    searchParams.append("providerId", providerId);
    return apiFetch<ApiResponse<BillPlan[]>>(`/bills/plans?${searchParams.toString()}`);
};

export const payBill = (data: PayBillRequest): Promise<ApiResponse<any>> =>
    apiFetch<ApiResponse<any>>("/bills/pay", {
        method: "POST",
        body: JSON.stringify(data),
    });
