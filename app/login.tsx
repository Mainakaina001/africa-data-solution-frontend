import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { useLogin } from "@/hooks/useAuth";
import {
    authenticateWithBiometrics,
    getBiometricCredentials,
    getBiometricEnabled,
    hasBiometricHardware,
    isBiometricsSupported,
    saveBiometricCredentials,
    setBiometricEnabled,
} from "@/utils/security";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .required("Email is required")
        .email("Please enter a valid email address"),
    password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export default function Login() {
    const { mutate: login, isPending, error } = useLogin();
    const [hasBiometrics, setHasBiometrics] = useState(false);
    const [canBiometricLogin, setCanBiometricLogin] = useState(false);
    const [biometricEmail, setBiometricEmail] = useState("");

    const checkBiometrics = async () => {
        const hasHw = await hasBiometricHardware();
        // Show fingerprint option if hardware exists, or by default on mobile platforms
        setHasBiometrics(hasHw || Platform.OS !== 'web');

        const supported = await isBiometricsSupported();
        const enabled = await getBiometricEnabled();
        const creds = await getBiometricCredentials();

        if (supported && enabled && creds?.email && creds?.password) {
            setCanBiometricLogin(true);
            setBiometricEmail(creds.email);
        } else {
            setCanBiometricLogin(false);
            setBiometricEmail(creds?.email || "");
        }
    };

    useEffect(() => {
        checkBiometrics();
    }, []);

    const handleLogin = (values: { email: string; password: string }) => {
        login(
            { email: values.email, password: values.password },
            {
                onSuccess: async (res: any) => {
                    Toast.show({
                        type: 'success',
                        text1: 'Login Successful',
                        text2: res?.message || res?.data?.message || 'Welcome back!',
                    });

                    // Check if device supports biometrics
                    const supported = await isBiometricsSupported();
                    const enabled = await getBiometricEnabled();

                    if (supported) {
                        if (enabled) {
                            // Update stored credentials securely
                            await saveBiometricCredentials({
                                email: values.email,
                                password: values.password,
                            });
                        } else {
                            // Prompt user to enable biometric login for faster subsequent logins
                            Alert.alert(
                                'Enable Fingerprint Login?',
                                'Would you like to use your fingerprint to log in next time without typing your password?',
                                [
                                    {
                                        text: 'Not Now',
                                        style: 'cancel',
                                    },
                                    {
                                        text: 'Enable',
                                        onPress: async () => {
                                            const success = await authenticateWithBiometrics('Confirm fingerprint to enable');
                                            if (success) {
                                                await setBiometricEnabled(true);
                                                await saveBiometricCredentials({
                                                    email: values.email,
                                                    password: values.password,
                                                });
                                                setCanBiometricLogin(true);
                                                setBiometricEmail(values.email);
                                                Toast.show({
                                                    type: 'success',
                                                    text1: 'Fingerprint Enabled',
                                                    text2: 'You can now log in using your fingerprint.',
                                                });
                                            }
                                        },
                                    },
                                ]
                            );
                        }
                    }
                },
                onError: (err: any) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Login Failed',
                        text2: err?.data?.message || err?.message || 'An error occurred. Please try again.',
                    });
                },
            }
        );
    };

    const handleBiometricLogin = async () => {
        const supported = await isBiometricsSupported();
        if (!supported) {
            Toast.show({
                type: 'info',
                text1: 'Biometrics Not Enrolled',
                text2: 'Please set up fingerprint or Face ID in your device settings first.',
            });
            return;
        }

        const enabled = await getBiometricEnabled();
        const creds = await getBiometricCredentials();

        if (!enabled || !creds?.email || !creds?.password) {
            Toast.show({
                type: 'info',
                text1: 'First-time Setup Required',
                text2: 'Please log in with your email & password once to enable fingerprint login.',
            });
            return;
        }

        const success = await authenticateWithBiometrics('Log in with your fingerprint');
        if (success) {
            handleLogin({ email: creds.email, password: creds.password });
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Login</Text>

                <View style={styles.headerSection}>
                    <Text style={styles.welcome}>Welcome Back 👋</Text>
                    <Text style={styles.subtitle}>Log in to your account</Text>
                </View>

                <Formik
                    initialValues={{ email: biometricEmail || "", password: "" }}
                    enableReinitialize
                    validationSchema={LoginSchema}
                    onSubmit={handleLogin}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <View>
                            <View style={styles.inputContainer}>
                                <Input
                                    placeholder="Email address"
                                    value={values.email}
                                    onChangeText={handleChange("email")}
                                    onBlur={handleBlur("email")}
                                    error={errors.email}
                                    touched={touched.email}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <Input
                                    placeholder="Password"
                                    value={values.password}
                                    onChangeText={handleChange("password")}
                                    onBlur={handleBlur("password")}
                                    error={errors.password}
                                    touched={touched.password}
                                    showPasswordToggle
                                    autoCapitalize="none"
                                />
                            </View>

                            <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                                <Text style={styles.forgotPassword}>Forgot Password?</Text>
                            </TouchableOpacity>

                            {error && (
                                <Text style={styles.errorText}>{(error as any)?.data?.message || error.message}</Text>
                            )}

                            <Button
                                title={isPending ? "Logging in..." : "Log In"}
                                onPress={handleSubmit}
                                isDisabled={isPending}
                            />

                            {hasBiometrics && (
                                <TouchableOpacity
                                    style={styles.biometricBtn}
                                    onPress={handleBiometricLogin}
                                    disabled={isPending}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.biometricIconWrap}>
                                        <Ionicons name="finger-print" size={24} color={Colors.primary} />
                                    </View>
                                    <Text style={styles.biometricText}>
                                        {canBiometricLogin && biometricEmail
                                            ? `Log in as ${biometricEmail}`
                                            : "Log in with Fingerprint"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </Formik>

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/signup")}>
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        marginTop: 40,
    },
    contentContainer: {
        padding: 16,
        paddingTop: 40,
        paddingBottom: 40,
    },

    title: {
        alignSelf: "center",
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 16,
        color: Colors.textPrimary,
    },
    headerSection: {
        marginBottom: 24,
    },
    welcome: {
        fontSize: 22,
        fontWeight: "700",
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 8,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 24,
        color: Colors.tint,
        fontSize: 14,
        fontWeight: "600",
    },
    errorText: {
        color: "#FF4444",
        fontSize: 14,
        marginBottom: 12,
        textAlign: "center",
    },
    signupContainer: {
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    signupText: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
    signupLink: {
        fontSize: 16,
        color: Colors.accent,
        fontWeight: "600",
    },
    biometricBtn: {
        marginTop: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: Colors.primary,
        gap: 10,
    },
    biometricIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: `${Colors.primary}15`,
        alignItems: "center",
        justifyContent: "center",
    },
    biometricText: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.primary,
    },
});
