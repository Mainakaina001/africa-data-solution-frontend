import { router } from "expo-router";
import { useEffect } from "react";

import {
    apiFetch,
    removeToken,
    saveToken,
} from "@/services/api";
import {
    useGetMeQuery,
    useLoginMutation,
    useRegisterMutation
} from "@/store/api/apiSlice";
import { useAppDispatch } from "@/store/hooks";
import { logout, setCredentials, updateUser } from "@/store/slices/authSlice";

// ─── Register ───────

export function useRegister() {
    const dispatch = useAppDispatch();
    const [trigger, { isLoading, error, data }] = useRegisterMutation();

    useEffect(() => {
        if (data?.success && data.data) {
            // Registration successful — send user to login
            router.replace("/login");
        }
    }, [data]);


    const mutate = async (values: any, options?: any) => {
        try {
            const result = await trigger(values).unwrap();
            options?.onSuccess?.(result);
        } catch (err) {
            options?.onError?.(err);
        }
    };

    return {
        mutate,
        isPending: isLoading,
        error: error as Error | null,
    };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export function useLogin() {
    const dispatch = useAppDispatch();
    const [trigger, { isLoading, error, data }] = useLoginMutation();

    useEffect(() => {
        if (data?.success && data.data) {
            const { token, user } = data.data;
            if (token) {
                saveToken(token).then(() => {
                    dispatch(setCredentials({ user, token }));
                    router.replace("/(tabs)");
                });
            }
        }
    }, [data, dispatch]);

    const mutate = async (values: any, options?: any) => {
        try {
            const result = await trigger(values).unwrap();
            options?.onSuccess?.(result);
        } catch (err: any) {
            options?.onError?.(err);
        }
    };

    return {
        mutate,
        isPending: isLoading,
        error: error as Error | null,
    };
}

// ─── Get Current User ─────────────────────────────────────────────────────────

export function useGetMe(enabled = true) {
    const dispatch = useAppDispatch();
    const { data, error, isLoading, refetch } = useGetMeQuery(undefined, {
        skip: !enabled,
    });

    useEffect(() => {
        if (data?.success && data.data) {
            dispatch(updateUser(data.data));
        }
    }, [data, dispatch]);

    return {
        data,
        error: error as Error | null,
        isLoading,
        refetch,
    };
}

// ─── Logout ───────────────────────────────────────────────────────────────────
// VULN-011 FIX: Logout now calls POST /auth/logout to invalidate the token
// server-side before clearing local state. If the server call fails (network
// offline, server error), local cleanup still happens — the user is always
// signed out of the device regardless.

export function useLogout() {
    const dispatch = useAppDispatch();

    return async () => {
        try {
            // Attempt server-side token invalidation (JWT blocklist / session delete)
            await apiFetch('/auth/logout', { method: 'POST' });
        } catch {
            // Network failure or server error — proceed with local logout anyway
        } finally {
            await removeToken();           // Clear SecureStore
            dispatch(logout());            // Clear Redux auth state
            router.replace('/login');
        }
    };
}

