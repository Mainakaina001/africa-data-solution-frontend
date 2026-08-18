import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CustomLoader } from "@/components/ui/CustomLoader";
import * as Yup from "yup";
import { apiFetch } from "@/services/api"; // VULN-006
import Toast from "react-native-toast-message";  // VULN-006


// Validation Schema
const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .required("Email is required")
        .email("Please enter a valid email address"),
});

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // VULN-006 FIX: Real API call — no longer a stub.
    // VULN-010 FIX: No console.log of user email.
    const handleForgotPassword = async (values: { email: string }) => {
        setIsLoading(true);
        try {
            await apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: values.email }),
            });
            setIsSuccess(true);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.message || 'Could not send reset email. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerSection}>
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed-outline" size={64} color={Colors.tint} />
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                    {isSuccess
                        ? "Check your email for a password reset link"
                        : "Don't worry! Enter your email address and we'll send you a link to reset your password"
                    }
                </Text>
            </View>

            {!isSuccess ? (
                <Formik
                    initialValues={{ email: "" }}
                    validationSchema={ForgotPasswordSchema}
                    onSubmit={handleForgotPassword}
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
                            </View>

                            <Button
                                title={isLoading ? "Sending..." : "Send Reset Link"}
                                onPress={handleSubmit}
                                isDisabled={isLoading}
                            />

                            {isLoading && (
                                <View style={styles.loadingContainer}>
                                    <CustomLoader size="small" color={Colors.tint} />
                                </View>
                            )}
                        </View>
                    )}
                </Formik>
            ) : (
                <View style={styles.successContainer}>
                    <View style={styles.successIconContainer}>
                        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                    </View>
                    <Text style={styles.successTitle}>Email Sent!</Text>
                    <Text style={styles.successMessage}>
                        We've sent a password reset link to your email address.
                        Please check your inbox and follow the instructions.
                    </Text>
                    <Button
                        title="Back to Login"
                        onPress={() => router.replace("/login")}
                    />
                </View>
            )}

            {!isSuccess && (
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Remember your password? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.loginLink}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingTop: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 16,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: `${Colors.tint}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 16,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    loadingContainer: {
        marginTop: 12,
        alignItems: 'center',
    },
    loginContainer: {
        marginTop: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginText: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
    loginLink: {
        fontSize: 16,
        color: Colors.accent,
        fontWeight: '600',
    },
    successContainer: {
        alignItems: 'center',
    },
    successIconContainer: {
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    successMessage: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 16,
    },
});
