import {
    useGetDataPlanByIdQuery,
    useGetDataPlansQuery,
    useGetLiveDataPlansQuery,
    useGetVirtualAccountsQuery
} from "@/store/api/apiSlice";

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
