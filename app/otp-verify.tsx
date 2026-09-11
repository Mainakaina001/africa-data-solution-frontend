import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import { forgotPassword } from "@/services/api";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OtpVerify() {
    const { email } = useLocalSearchParams<{ email: string }>();
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
    const [isResending, setIsResending] = useState(false);

    const inputRefs = useRef<(TextInput | null)[]>([]);
    const shakeAnim = useRef(new Animated.Value(0)).current;
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

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const triggerShake = () => {
        shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleOtpChange = (value: string, index: number) => {
        // Allow only digits
        const digit = value.replace(/[^0-9]/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Auto-advance
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join("");
        if (otpCode.length < OTP_LENGTH) {
            triggerShake();
            Toast.show({
                type: "error",
                text1: "Incomplete Code",
                text2: `Please enter all ${OTP_LENGTH} digits.`,
            });
            return;
        }

        // The OTP itself is the resetToken — pass it directly to the reset screen.
        // The backend validates it as part of POST /auth/reset-password.
        router.replace({
            pathname: "/reset-password",
            params: { email, resetToken: otpCode },
        });
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || isResending) return;
        setIsResending(true);
        try {
            await forgotPassword({ email });
            setResendCooldown(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(""));
            inputRefs.current[0]?.focus();
            Toast.show({
                type: "success",
                text1: "Code Resent",
                text2: "A new code has been sent to your email.",
            });
        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Resend Failed",
                text2: error?.data?.message || error?.message || "Could not resend code. Please try again.",
            });
        } finally {
            setIsResending(false);
        }
    };

    const otpFilled = otp.join("").length === OTP_LENGTH;
    const maskedEmail = email
        ? email.replace(/(.{2})[^@]+(@.+)/, "$1****$2")
        : "your email";

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
                    style={[
                        styles.content,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconInner}>
                            <Ionicons name="mail-open-outline" size={52} color={Colors.tint} />
                        </View>
                        <View style={styles.iconBadge}>
                            <Ionicons name="key-outline" size={18} color="#fff" />
                        </View>
                    </View>

                    {/* Header */}
                    <Text style={styles.title}>Check Your Email</Text>
                    <Text style={styles.subtitle}>
                        We've sent a 6-digit verification code to{"\n"}
                        <Text style={styles.emailHighlight}>{maskedEmail}</Text>
                    </Text>

                    {/* OTP Inputs */}
                    <Animated.View
                        style={[
                            styles.otpContainer,
                            { transform: [{ translateX: shakeAnim }] },
                        ]}
                    >
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref; }}
                                style={[
                                    styles.otpInput,
                                    digit ? styles.otpInputFilled : null,
                                    index === otp.findIndex((d) => !d) && styles.otpInputActive,
                                ]}
                                value={digit}
                                onChangeText={(val) => handleOtpChange(val, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                caretHidden
                                autoFocus={index === 0}
                            />
                        ))}
                    </Animated.View>

                    {/* Verify Button */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Continue"
                            onPress={handleVerify}
                            isDisabled={!otpFilled}
                        />
                    </View>

                    {/* Resend */}
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>
                        {resendCooldown > 0 ? (
                            <Text style={styles.resendCooldown}>
                                Resend in {resendCooldown}s
                            </Text>
                        ) : (
                            <TouchableOpacity onPress={handleResend} disabled={isResending}>
                                <Text style={styles.resendLink}>
                                    {isResending ? "Sending..." : "Resend"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Note */}
                    <View style={styles.noteContainer}>
                        <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.noteText}>
                            The code expires in 10 minutes. Check your spam folder if you don't see it.
                        </Text>
                    </View>
                </Animated.View>
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
        flexGrow: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        marginBottom: 24,
    },
    content: {
        flex: 1,
        alignItems: "center",
    },
    iconContainer: {
        width: 110,
        height: 110,
        marginBottom: 28,
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
        backgroundColor: Colors.tint,
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
        marginBottom: 36,
        paddingHorizontal: 12,
    },
    emailHighlight: {
        color: Colors.tint,
        fontWeight: "600",
    },
    otpContainer: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 36,
        justifyContent: "center",
    },
    otpInput: {
        width: 48,
        height: 56,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#D1D1D6",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        fontSize: 22,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    otpInputFilled: {
        borderColor: Colors.tint,
        backgroundColor: `${Colors.tint}08`,
    },
    otpInputActive: {
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    buttonContainer: {
        width: "100%",
        marginBottom: 20,
    },
    resendContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    resendText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    resendCooldown: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: "600",
    },
    resendLink: {
        fontSize: 14,
        color: Colors.tint,
        fontWeight: "700",
    },
    noteContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: `${Colors.tint}08`,
        borderRadius: 12,
        padding: 12,
        gap: 8,
        width: "100%",
    },
    noteText: {
        flex: 1,
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
});
