import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Base URL ───
export const BASE_URL = "https://africa-data-solution-backend.onrender.com/api/v1";

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
    balance: string; // API returns balance as a string e.g. "0"
    currency: string;
}

export interface User {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    isActive?: boolean;
    isVerified?: boolean;
    wallet?: Wallet;
    virtualAccounts?: VirtualAccount[];
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
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
    name: string;
    price: string;
    telco_price?: number | string;
    networkId: number;
    network: string;
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
    network: string;
    planName: string;
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
    reference: string;
    createdAt: string;
}

export interface GetDataOrdersParams {
    status?: 'PENDING' | 'COMPLETED' | 'FAILED';
    limit?: number;
    offset?: number;
}

// ─── Wallet Transactions ───

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
    metadata?: any;
    createdAt: string;
    updatedAt?: string;
}

export interface TransactionsResponse {
    transactions: Transaction[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface GetTransactionsParams {
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

/** Returns the stored JWT or null */
export const getToken = (): Promise<string | null> =>
    AsyncStorage.getItem("auth_token");

/** Saves the JWT to AsyncStorage */
export const saveToken = (token: string): Promise<void> =>
    AsyncStorage.setItem("auth_token", token);

/** Removes the JWT from AsyncStorage */
export const removeToken = (): Promise<void> =>
    AsyncStorage.removeItem("auth_token");

async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

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

// VIRTUAL ACCOUNT

export const getVirtualAccounts = (): Promise<ApiResponse<VirtualAccount[]>> =>
    apiFetch<ApiResponse<VirtualAccount[]>>("/wallet/virtual-accounts");

// DATA PLANS

export interface PurchaseDataRequest {
    dataPlanId: string;
    phone: string;
}

export const getLiveDataPlans = (): Promise<ApiResponse<NetworkPlans[]>> =>
    apiFetch<ApiResponse<NetworkPlans[]>>("/data/plans/live");

export const getDataOrders = (params: GetDataOrdersParams = {}): Promise<ApiResponse<DataOrder[]>> => {
    const queryParts: string[] = [];
    if (params.status) queryParts.push(`status=${params.status}`);
    if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
    if (params.offset !== undefined) queryParts.push(`offset=${params.offset}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : "";
    return apiFetch<ApiResponse<DataOrder[]>>(`/data/orders${queryString}`);
};

export const getDataOrderById = (id: string): Promise<ApiResponse<DataOrder>> =>
    apiFetch<ApiResponse<DataOrder>>(`/data/orders/${id}`);

/**
 * Get raw SME Plug plans (debug endpoint)
 */
export const getRawDataPlans = (): Promise<ApiResponse<unknown>> =>
    apiFetch<ApiResponse<unknown>>("/data/plans/raw");

export const getDataPlans = (
    networkId?: number
): Promise<ApiResponse<DataPlan[]>> => {
    const query = networkId !== undefined ? `?networkId=${networkId}` : "";
    return apiFetch<ApiResponse<DataPlan[]>>(`/data/plans${query}`);
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
    networkId: number;
    amount: number;
    phoneNumber: string;
}

export interface AirtimeNetworksResponse {
    status: boolean;
    networks: Record<string, string>; // e.g. "1": "MTN"
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
}

export const getBillProviders = (category: string): Promise<ApiResponse<BillProvider[]>> =>
    apiFetch<ApiResponse<BillProvider[]>>(`/bills/providers?category=${category}`);

export const getBillPlans = (providerId: string): Promise<ApiResponse<BillPlan[]>> =>
    apiFetch<ApiResponse<BillPlan[]>>(`/bills/plans?providerId=${providerId}`);

export const payBill = (data: PayBillRequest): Promise<ApiResponse<any>> =>
    apiFetch<ApiResponse<any>>("/bills/pay", {
        method: "POST",
        body: JSON.stringify(data),
    });
