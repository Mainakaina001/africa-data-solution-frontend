import {
    useGetDataPlanByIdQuery,
    useGetDataPlansQuery,
    useGetLiveDataPlansQuery,
    useGetMeQuery,
    useGetVirtualAccountsQuery,
    useGetWalletBalanceQuery,
} from "@/store/api/apiSlice";
import { useAppSelector } from "@/store/hooks";

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL ACCOUNT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all virtual accounts for the currently logged-in user.
 * Provides tag "Wallet" for invalidation.
 */
export function useVirtualAccounts(enabled = true) {
    const { data, error, isLoading, refetch } = useGetVirtualAccountsQuery(undefined, {
        skip: !enabled,
    });

    return { data, error: error as Error | null, isLoading, refetch };
}

// ─────────────────────────────────────────────────────────────────────────────
// WALLET BALANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the wallet balance for the currently logged-in user.
 * Automatically queries user profile if not present in Redux state.
 */
export function useWalletBalance(enabled = true) {
    const user = useAppSelector((state) => state.auth.user);
    const { data: meData } = useGetMeQuery(undefined, { skip: !enabled });
    const activeUser = user || meData?.data;

    const { data, error, isLoading, isFetching, refetch } = useGetWalletBalanceQuery(
        activeUser ? { user: { id: activeUser.id, email: activeUser.email, phone: activeUser.phone, role: activeUser.role ?? 'USER' } } : undefined,
        { skip: !enabled || !activeUser }
    );

    const rawBalance = data?.data?.balance ?? activeUser?.wallet?.balance ?? null;
    const currency = data?.data?.currency ?? activeUser?.wallet?.currency ?? 'NGN';
    const numBalance = rawBalance !== null && rawBalance !== undefined ? Number(rawBalance) : 0;
    const formattedBalance = rawBalance !== null && rawBalance !== undefined
        ? `₦${Number(rawBalance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '₦0.00';

    return {
        balance: rawBalance,
        numBalance,
        formattedBalance,
        currency,
        data,
        error: error as Error | null,
        isLoading,
        isFetching,
        refetch,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA PLANS – LIVE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches live data plans from SME Plug, grouped by network.
 */
export function useLiveDataPlans(enabled = true) {
    const { data, error, isLoading, refetch } = useGetLiveDataPlansQuery(undefined, {
        skip: !enabled,
    });

    return { data, error: error as Error | null, isLoading, refetch };
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA PLANS – ALL (with optional network filter)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all data plans, optionally filtered by networkId.
 * @param networkId  Optional network filter
 * @param enabled    Whether the query should auto-run
 */
export function useDataPlans(networkId?: number, enabled = true) {
    const { data, error, isLoading, refetch } = useGetDataPlansQuery(networkId, {
        skip: !enabled,
    });

    return { data, error: error as Error | null, isLoading, refetch };
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA PLANS – SINGLE PLAN BY ID
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches a single data plan by its UUID.
 * @param id  UUID of the data plan
 */
export function useDataPlanById(id?: string) {
    const { data, error, isLoading, refetch } = useGetDataPlanByIdQuery(id!, {
        skip: !id,
    });

    return { data, error: error as Error | null, isLoading, refetch };
}
