/**
 * authSlice.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * VULN-018 FIX: The JWT token is no longer stored in Redux state.
 *
 * Previously, the full JWT string lived in `state.auth.token`, which meant:
 *   - It was visible in Redux DevTools (accessible via Flipper in debug builds)
 *   - It could leak if redux-persist were ever added
 *   - It was serialised in memory alongside user data
 *
 * Now the token lives exclusively in expo-secure-store (see secureToken.ts).
 * Redux only holds the non-sensitive `user` object and the `isAuthenticated`
 * boolean — both of which are safe to have in plain memory.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { User } from "@/services/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: User | null;
    // VULN-018 FIX: token field removed — stored only in expo-secure-store
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            // VULN-018: token is saved to SecureStore in useAuth.ts before this
            // action is dispatched — it must NOT be stored in Redux state.
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            // token intentionally NOT stored in state
            state.isAuthenticated = true;
        },
        // Stores a newly-registered user so create-pin can access their
        // id/email/phone without being fully authenticated yet.
        setPendingUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = false; // NOT authenticated until they log in
        },
        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        setHasPin: (state, action: PayloadAction<boolean>) => {
            if (state.user) {
                state.user.hasPin = action.payload;
                state.user.hasTransactionPin = action.payload;
                state.user.isPinSet = action.payload;
            }
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, setPendingUser, updateUser, setHasPin, logout } = authSlice.actions;
export default authSlice.reducer;
