import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
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

const ResetPasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain at least one uppercase letter")
        .matches(/[0-9]/, "Must contain at least one number"),
    confirmPassword: Yup.string()
        .required("Please confirm your new password")
        .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});

const PasswordStrengthBar = ({ password }: { password: string }) => {
    const getStrength = () => {
        if (!password) return { score: 0, label: "", color: "transparent" };
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) return { score, label: "Weak", color: Colors.error };
        if (score === 2) return { score, label: "Fair", color: Colors.warning };
        if (score === 3) return { score, label: "Good", color: Colors.secondary };
        return { score, label: "Strong", color: Colors.success };
    };

    const { score, label, color } = getStrength();

    return (
        <View style={strengthStyles.container}>
            <View style={strengthStyles.bars}>
                {[1, 2, 3, 4].map((i) => (
                    <View
                        key={i}
                        style={[
                            strengthStyles.bar,
                            { backgroundColor: i <= score ? color : "#E5E5EA" },
                        ]}
                    />
                ))}
            </View>
            {label ? <Text style={[strengthStyles.label, { color }]}>{label}</Text> : null}
        </View>
    );
};

const strengthStyles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: -8,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    bars: {
        flex: 1,
        flexDirection: "row",
        gap: 4,
    },
    bar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        width: 48,
        textAlign: "right",
    },
});

export default function ResetPassword() {
    const { email, resetToken } = useLocalSearchParams<{ email: string; resetToken: string }>();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleResetPassword = async (values: {
        newPassword: string;
        confirmPassword: string;
    }) => {
        try {
            await apiFetch("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    resetToken,
                    newPassword: values.newPassword,
                }),
            });

            Toast.show({
                type: "success",
                text1: "Password Reset!",
                text2: "Your password has been updated. Please log in.",
                visibilityTime: 2000,
                onHide: () => router.replace("/login"),
            });
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Reset Failed",
                text2:
                    error?.data?.message ||
                    error?.message ||
                    "Could not reset password. Please try again.",
            });
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
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>

                <Animated.View
                    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: "center" }}
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconInner}>
                            <Ionicons name="lock-open-outline" size={52} color={Colors.tint} />
                        </View>
                        <View style={styles.iconBadge}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                    </View>

                    {/* Header */}
                    <Text style={styles.title}>Create New Password</Text>
                    <Text style={styles.subtitle}>
                        Your identity has been verified.{"\n"}
                        Set a strong new password for your account.
                    </Text>

                    {/* Form */}
                    <Formik
                        initialValues={{ newPassword: "", confirmPassword: "" }}
                        validationSchema={ResetPasswordSchema}
                        onSubmit={handleResetPassword}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                            <View style={styles.form}>
                                {/* New Password */}
                                <Input
                                    label="New Password"
                                    placeholder="Enter new password"
                                    value={values.newPassword}
                                    onChangeText={handleChange("newPassword")}
                                    onBlur={handleBlur("newPassword")}
                                    error={errors.newPassword}
                                    touched={touched.newPassword}
                                    showPasswordToggle
                                    autoCapitalize="none"
                                />

                                {/* Strength bar */}
                                <PasswordStrengthBar password={values.newPassword} />

                                {/* Confirm Password */}
                                <Input
                                    label="Confirm Password"
                                    placeholder="Re-enter your new password"
                                    value={values.confirmPassword}
                                    onChangeText={handleChange("confirmPassword")}
                                    onBlur={handleBlur("confirmPassword")}
                                    error={errors.confirmPassword}
                                    touched={touched.confirmPassword}
                                    showPasswordToggle
                                    autoCapitalize="none"
                                />

                                {/* Password requirements */}
                                <View style={styles.requirementsBox}>
                                    <Text style={styles.reqTitle}>Password must have:</Text>
                                    <RequirementRow
                                        met={values.newPassword.length >= 8}
                                        text="At least 8 characters"
                                    />
                                    <RequirementRow
                                        met={/[A-Z]/.test(values.newPassword)}
                                        text="One uppercase letter"
                                    />
                                    <RequirementRow
                                        met={/[0-9]/.test(values.newPassword)}
                                        text="One number"
                                    />
                                </View>

                                <Button
                                    title={isSubmitting ? "Resetting..." : "Reset Password"}
                                    onPress={handleSubmit}
                                    isDisabled={isSubmitting}
                                />
                            </View>
                        )}
                    </Formik>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function RequirementRow({ met, text }: { met: boolean; text: string }) {
    return (
        <View style={reqStyles.row}>
            <Ionicons
                name={met ? "checkmark-circle" : "ellipse-outline"}
                size={15}
                color={met ? Colors.success : "#C7C7CC"}
            />
            <Text style={[reqStyles.text, met && reqStyles.textMet]}>{text}</Text>
        </View>
    );
}

const reqStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 4,
    },
    text: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    textMet: {
        color: Colors.success,
    },
});

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingTop: 48,
        flexGrow: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        marginBottom: 24,
    },
    iconContainer: {
        width: 110,
        height: 110,
        marginBottom: 24,
        position: "relative",
    },
    iconInner: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: `${Colors.tint}12`,
        borderWidth: 2,
        borderColor: `${Colors.tint}25`,
        justifyContent: "center",
        alignItems: "center",
    },
    iconBadge: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.success,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.background,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: Colors.textPrimary,
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 12,
    },
    form: {
        width: "100%",
        gap: 0,
    },
    requirementsBox: {
        backgroundColor: "#F7F7FA",
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
        marginTop: -4,
    },
    reqTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.textSecondary,
        marginBottom: 6,
    },
});
