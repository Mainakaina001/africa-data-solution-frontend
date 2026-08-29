import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { useChangePasswordMutation } from "@/store/api/apiSlice";
import { useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
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

const ChangePasswordSchema = Yup.object().shape({
    currentPassword: Yup.string()
        .required("Current password is required"),
    newPassword: Yup.string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters"),
    confirmPassword: Yup.string()
        .required("Please confirm your new password")
        .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});

export default function ChangePassword() {
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const user = useAppSelector((state) => state.auth.user);

    const handleChangePassword = async (values: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }) => {
        if (!user) {
            Toast.show({
                type: "error",
                text1: "Session Error",
                text2: "User session not found. Please log in again.",
            });
            return;
        }

        try {
            const res = await changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role ?? "USER",
                },
            }).unwrap();

            Toast.show({
                type: "success",
                text1: "Password Changed",
                text2: res?.message || res?.data?.message || "Password updated successfully.",
                visibilityTime: 1800,
                onHide: () => router.back(),
            });
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: "Change Failed",
                text2: err?.data?.message || err?.message || "Could not change password.",
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
                {/* Header */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
                </TouchableOpacity>

                {/* Icon + Title */}
                <View style={styles.iconWrap}>
                    <Ionicons name="lock-closed" size={38} color={Colors.primary} />
                </View>
                <Text style={styles.title}>Change Password</Text>
                <Text style={styles.subtitle}>
                    Enter your current password and choose a new one
                </Text>

                {/* Form */}
                <Formik
                    initialValues={{
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                    }}
                    validationSchema={ChangePasswordSchema}
                    onSubmit={handleChangePassword}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <View style={styles.form}>
                            <Input
                                placeholder="Current password"
                                value={values.currentPassword}
                                onChangeText={handleChange("currentPassword")}
                                onBlur={handleBlur("currentPassword")}
                                error={errors.currentPassword}
                                touched={touched.currentPassword}
                                showPasswordToggle
                                autoCapitalize="none"
                            />
                            <Input
                                placeholder="New password"
                                value={values.newPassword}
                                onChangeText={handleChange("newPassword")}
                                onBlur={handleBlur("newPassword")}
                                error={errors.newPassword}
                                touched={touched.newPassword}
                                showPasswordToggle
                                autoCapitalize="none"
                            />
                            <Input
                                placeholder="Confirm new password"
                                value={values.confirmPassword}
                                onChangeText={handleChange("confirmPassword")}
                                onBlur={handleBlur("confirmPassword")}
                                error={errors.confirmPassword}
                                touched={touched.confirmPassword}
                                showPasswordToggle
                                autoCapitalize="none"
                            />

                            <Button
                                title={isLoading ? "Updating..." : "Update Password"}
                                onPress={handleSubmit}
                                isDisabled={isLoading}
                            />
                        </View>
                    )}
                </Formik>
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
    },
    contentContainer: {
        padding: 20,
        paddingTop: 48,
        alignItems: "center",
    },
    backButton: {
        alignSelf: "flex-start",
        marginBottom: 28,
    },
    iconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${Colors.primary}15`,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.textPrimary,
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: "center",
        marginBottom: 32,
        paddingHorizontal: 16,
        lineHeight: 22,
    },
    form: {
        width: "100%",
        gap: 4,
    },
});
