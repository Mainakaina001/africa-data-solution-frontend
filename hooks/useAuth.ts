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
import { logout, setCredentials, setPendingUser, updateUser } from "@/store/slices/authSlice";

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Register ───────

export function useRegister() {
    const dispatch = useAppDispatch();
    const [trigger, { isLoading, error, data }] = useRegisterMutation();

    useEffect(() => {
        if (data?.success && data.data) {
            // Flag that this user needs to create a transaction PIN upon login
            const email = data.data.user?.email;
            if (email) {
                AsyncStorage.setItem(`needs_pin_${email.toLowerCase()}`, "true").catch(() => {});
            }
            if (data.data.user?.id) {
                AsyncStorage.setItem(`needs_pin_${data.data.user.id}`, "true").catch(() => {});
            }
            // Registration complete — route user to login
            router.replace("/login");
        }
    }, [data, dispatch]);

    const mutate = async (values: any, options?: any) => {
        try {
            // Also store flag proactively with submitted email
            if (values?.email) {
                AsyncStorage.setItem(`needs_pin_${values.email.toLowerCase()}`, "true").catch(() => {});
            }
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

// ─── Login han──────

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

