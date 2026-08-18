/**
 * pendingTransactionSlice.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * VULN-004 FIX: Secure in-memory payload store for pending transactions.
 *
 * Instead of passing financial data (amount, plan IDs, meter numbers) through
 * navigable URL query params (which are tamperable via deep links, logged by
 * routers, and visible in crash reporters), the entire transaction payload is
 * stored in Redux with an opaque UUID as the navigation key.
 *
 * The confirm screen receives only the UUID → looks up the canonical payload
 * from this slice → impossible to tamper with via URL manipulation.
 *
 * The slice is cleared on:
 *   - Successful transaction (clearPendingTransaction)
 *   - Failed transaction (clearPendingTransaction)
 *   - Logout (logout action from authSlice resets all state via configureStore)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/** All supported service types */
export type ServiceType =
    | "airtime"
    | "data"
    | "electricity"
    | "cable"
    | "education";

/** The canonical API payload for each service type */
export interface PendingTransactionPayload {
    /** Opaque ID used as the navigation param — no financial data in URL */
    id: string;

    /** Service type — drives which mutation is called in confirm.tsx */
    type: ServiceType;

    // ── Display fields (shown on the confirm screen) ─────────────────────────
    displayAmount: string;      // e.g. "1500"
    displayProvider: string;    // e.g. "MTN", "EKEDC"
    displayTarget: string;      // e.g. "08012345678", "45001234567"
    displayDescription: string; // e.g. "1GB SME FOR 30 Days"

    // ── Airtime payload ──────────────────────────────────────────────────────
    network?: string;
    amount?: number;
    phone?: string;

    // ── Data payload ─────────────────────────────────────────────────────────
    dataPlanId?: string;

    // ── Electricity payload ──────────────────────────────────────────────────
    meterNumber?: string;
    serviceID?: string;
    variationCode?: string;

    // ── Cable (TV) payload ───────────────────────────────────────────────────
    smartcardNumber?: string;
    subscriptionType?: string;

    // ── Education payload ─────────────────────────────────────────────────────
    quantity?: number;
    profileId?: string;
}

interface PendingTransactionState {
    pending: PendingTransactionPayload | null;
}

const initialState: PendingTransactionState = {
    pending: null,
};

const pendingTransactionSlice = createSlice({
    name: "pendingTransaction",
    initialState,
    reducers: {
        setPendingTransaction: (
            state,
            action: PayloadAction<PendingTransactionPayload>
        ) => {
            state.pending = action.payload;
        },
        clearPendingTransaction: (state) => {
            state.pending = null;
        },
    },
});

export const { setPendingTransaction, clearPendingTransaction } =
    pendingTransactionSlice.actions;
export default pendingTransactionSlice.reducer;
