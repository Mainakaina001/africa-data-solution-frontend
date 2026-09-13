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
import { apiFetch } from "@/services/api";
import Toast from "react-native-toast-message";


// Validation Schema
const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .required("Email is required")
        .email("Please enter a valid email address"),
});

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [sentEmail, setSentEmail] = useState("");

    // Send OTP to email, then navigate to OTP verification screen.
    const handleForgotPassword = async (values: { email: string }) => {
        setIsLoading(true);
        try {
            const res: any = await apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email: values.email }),
            });
            setSentEmail(values.email);
            Toast.show({
                type: 'success',
                text1: 'Code Sent',
                text2: res?.message || res?.data?.message || 'A verification code has been sent to your email.',
            });
            // Navigate to OTP screen with email param
            router.push({
                pathname: '/otp-verify',
                params: { email: values.email },
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.data?.message || error?.message || 'Could not send reset email. Please try again.',
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
                    Don't worry! Enter your email address and we'll send you a 6-digit code to reset your password.
                </Text>
            </View>

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
                            title={isLoading ? "Sending..." : "Send Verification Code"}
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

            <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.loginLink}>Back to Login</Text>
                </TouchableOpacity>
            </View>
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

});
