import { router } from "expo-router";
import { useEffect } from "react";

import {
    apiFetch,
    getRefreshToken,
    removeRefreshToken,
    removeToken,
    saveRefreshToken,
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
    const [trigger, { isLoading, error }] = useLoginMutation();

    const mutate = async (values: any, options?: any) => {
        try {
            const result = await trigger(values).unwrap();

            // Save token and update Redux BEFORE navigating,
            // so useProtectedRoute sees isAuthenticated = true immediately
            if (result?.success && result.data) {
                const { accessToken, refreshToken, user } = result.data;
                if (accessToken) {
                    await saveToken(accessToken);
                    dispatch(setCredentials({ user, token: accessToken }));
                }
                if (refreshToken) {
                    await saveRefreshToken(refreshToken);
                }
            }

            options?.onSuccess?.(result);

            // Navigate only after token + Redux state are both set
            if (result?.success) {
                router.replace("/(tabs)");
            }
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

export function useLogout() {
    const dispatch = useAppDispatch();

    return async () => {
        try {
            const refreshToken = await getRefreshToken();
            // Attempt server-side token invalidation
            await apiFetch('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: refreshToken || "" }),
            });
        } catch {
            // Network failure or server error — proceed with local logout anyway
        } finally {
            await removeToken();           // Clear access token from SecureStore
            await removeRefreshToken();     // Clear refresh token from SecureStore
            dispatch(logout());            // Clear Redux auth state
            router.replace('/login');
        }
    };
}

