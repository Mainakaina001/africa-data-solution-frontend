/**
 * useProtectedRoute.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * VULN-002 FIX: Authentication route guard.
 *
 * Checks both:
 *   1. The Redux `isAuthenticated` flag (fast, in-memory check).
 *   2. The SecureStore token (authoritative, persisted check).
 *
 * If either check fails the user is redirected to /login and the token is
 * removed from SecureStore to ensure a clean state.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { removeToken, getToken } from "@/services/secureToken";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

export function useProtectedRoute() {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const isChecking = useRef(false);

    useEffect(() => {
        if (isChecking.current) return;
        isChecking.current = true;

        (async () => {
            try {
                // Primary check: Redux state (instant)
                if (!isAuthenticated) {
                    await removeToken(); // Ensure storage is also clear
                    dispatch(logout());
                    router.replace("/login");
                    return;
                }

                // Secondary check: SecureStore (authoritative)
                const token = await getToken();
                if (!token) {
                    dispatch(logout());
                    router.replace("/login");
                    return;
                }
            } finally {
                isChecking.current = false;
            }
        })();
    }, [isAuthenticated, dispatch]);
}
