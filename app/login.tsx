import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { useLogin } from "@/hooks/useAuth";
import { router } from "expo-router";
import { Formik } from "formik";
import React from "react";
import {
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

    const handleLogin = (values: { email: string; password: string }) => {
        login(
            { email: values.email, password: values.password },
            {
                onSuccess: (res: any) => {
                    Toast.show({
                        type: 'success',
                        text1: 'Login Successful',
                        text2: res?.message || 'Welcome back!',
                    });
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
                <Text style={styles.title}>Login Screen</Text>

                <View style={styles.headerSection}>
                    <Text style={styles.welcome}>Welcome Back 👋</Text>
                    <Text style={styles.subtitle}>Log in to your account</Text>
                </View>

                <Formik
                    initialValues={{ email: "", password: "" }}
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
                                <Text style={styles.errorText}>{error.message}</Text>
                            )}

                            <Button
                                title={isPending ? "Logging in..." : "Log In"}
                                onPress={handleSubmit}
                                isDisabled={isPending}
                            />
                        </View>
                    )}
                </Formik>

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/signup")}>
                        <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                {/* <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => console.log("Contact Us pressed")}
                >
                    <Text style={styles.contactText}>Contact Us</Text>
                </TouchableOpacity> */}
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
    // contactButton: {
    //     marginTop: 16,
    //     alignItems: "center",
    //     padding: 12,
    // },
    // contactText: {
    //     fontSize: 14,
    //     color: Colors.textSecondary,
    // },
});
