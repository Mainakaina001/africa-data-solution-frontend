import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { useRegister } from "@/hooks/useAuth";
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
    View
} from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const getStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const strength = getStrength();
    const getColor = () => {
        if (strength <= 2) return "#FF4444";
        if (strength <= 3) return "#FFA500";
        return "#4CAF50";
    };

    const getLabel = () => {
        if (strength <= 2) return "Weak";
        if (strength <= 3) return "Medium";
        return "Strong";
    };

    if (!password) return null;

    return (
        <View style={styles.strengthContainer}>
            <View style={styles.strengthBarContainer}>
                <View
                    style={[
                        styles.strengthBar,
                        { width: `${(strength / 5) * 100}%`, backgroundColor: getColor() },
                    ]}
                />
            </View>
            <Text style={[styles.strengthText, { color: getColor() }]}>{getLabel()}</Text>
        </View>
    );
};

// Validation Schema – aligned with the API request body
const SignupSchema = Yup.object().shape({
    firstName: Yup.string()
        .required("First name is required")
        .min(2, "Name must be at least 2 characters")
        .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
    lastName: Yup.string()
        .required("Last name is required")
        .min(2, "Name must be at least 2 characters")
        .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
    email: Yup.string()
        .required("Email is required")
        .email("Please enter a valid email address"),
    phone: Yup.string()
        .required("Phone number is required")
        .matches(/^[0-9+\-\s()]+$/, "Please enter a valid phone number")
        .min(10, "Phone number must be at least 10 digits"),
    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),
});

export default function SignupScreen() {
    const { mutate: register, isPending, error } = useRegister();

    const handleSignup = (values: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
        confirmPassword: string;
    }) => {
        register(
            {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phone: values.phone,
                password: values.password,
            },
            {
                onSuccess: (res: any) => {
                    Toast.show({
                        type: 'success',
                        text1: 'Registration Successful! 🎉',
                        text2: res?.message || 'Your account has been created. Please log in.',
                    });
                },
                onError: (err: any) => {
                    Toast.show({
                        type: 'error',
                        text1: 'Registration Failed',
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
                <Text style={styles.header}>Africa Data Solutions</Text>
                <View style={styles.headerSection}>
                    <Text style={styles.welcome}>Create an Account </Text>
                    <Text style={styles.subtitle}>Join us today and get started</Text>
                </View>

                <Formik
                    initialValues={{
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        password: "",
                        confirmPassword: "",
                    }}
                    validationSchema={SignupSchema}
                    onSubmit={handleSignup}
                >
                    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                        <View>
                            <View style={styles.inputContainer}>
                                <Input
                                    placeholder="First name"
                                    value={values.firstName}
                                    onChangeText={handleChange("firstName")}
                                    onBlur={handleBlur("firstName")}
                                    error={errors.firstName}
                                    touched={touched.firstName}
                                    autoCapitalize="words"
                                />
                                <Input
                                    placeholder="Last name"
                                    value={values.lastName}
                                    onChangeText={handleChange("lastName")}
                                    onBlur={handleBlur("lastName")}
                                    error={errors.lastName}
                                    touched={touched.lastName}
                                    autoCapitalize="words"
                                />
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
                                    placeholder="Phone number"
                                    value={values.phone}
                                    onChangeText={handleChange("phone")}
                                    onBlur={handleBlur("phone")}
                                    error={errors.phone}
                                    touched={touched.phone}
                                    keyboardType="phone-pad"
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
                                <PasswordStrengthIndicator password={values.password} />

                                <Input
                                    placeholder="Confirm password"
                                    value={values.confirmPassword}
                                    onChangeText={handleChange("confirmPassword")}
                                    onBlur={handleBlur("confirmPassword")}
                                    error={errors.confirmPassword}
                                    touched={touched.confirmPassword}
                                    showPasswordToggle
                                    autoCapitalize="none"
                                />
                            </View>

                            {error && (
                                <Text style={styles.errorText}>{error.message}</Text>
                            )}

                            <Button
                                title={isPending ? "Creating Account..." : "Register"}
                                onPress={handleSubmit}
                                isDisabled={isPending}
                            />
                        </View>
                    )}
                </Formik>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push("/login")}>
                        <Text style={styles.loginLink}>Login</Text>
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
    },
    contentContainer: {
        padding: 16,
        paddingTop: 50,
        paddingBottom: 40,
    },
    header: {
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
    strengthContainer: {
        marginTop: -8,
        marginBottom: 16,
    },
    strengthBarContainer: {
        height: 4,
        backgroundColor: "#E0E0E0",
        borderRadius: 2,
        overflow: "hidden",
        marginBottom: 4,
    },
    strengthBar: {
        height: "100%",
        borderRadius: 2,
    },
    strengthText: {
        fontSize: 12,
        fontWeight: "600",
    },
    errorText: {
        color: "#FF4444",
        fontSize: 14,
        marginBottom: 12,
        textAlign: "center",
    },
    loginContainer: {
        marginTop: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 20,
    },
    loginText: {
        fontSize: 16,
        color: Colors.textPrimary,
    },
    loginLink: {
        fontSize: 16,
        color: Colors.accent,
        fontWeight: "600",
    },
});
