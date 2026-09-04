import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { useGetMeQuery } from "@/store/api/apiSlice";
import { useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

export default function FundingWallet() {
    const [showMonnifyModal, setShowMonnifyModal] = useState(false);
    const [amount, setAmount] = useState("");

    const user = useAppSelector((state) => state.auth.user);
    const { data: meData } = useGetMeQuery();
    const meUser = meData?.data ?? user;
    const virtualAccount = meUser?.virtualAccount ?? meUser?.virtualAccounts?.[0];

    const copyToClipboard = async (text: string, type: string) => {
        await Clipboard.setStringAsync(text);
        Toast.show({
            type: "success",
            text1: "Copied successfully",
            text2: `Your ${type} has been copied to the clipboard.`,
            position: "top",
        });
    };

    const handleMonnifyContinue = () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            Toast.show({
                type: "error",
                text1: "Invalid Amount",
                text2: "Please enter a valid amount to fund.",
                position: "top",
            });
            return;
        }

        // VULN-010 FIX: Removed console.log of financial amount
        setShowMonnifyModal(false);
        Toast.show({
            type: 'info',
            text1: 'Monnify Option Selected',
            text2: `Proceeding to fund ₦${amount}. Integration pending.`,
            position: 'top',
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fund Wallet</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Bank Transfer</Text>
                <Text style={styles.sectionSubtitle}>
                    Transfer to the account below to instantly fund your wallet.
                </Text>

                {/* Virtual Account Card */}
                {virtualAccount ? (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.bankIconContainer}>
                                <Ionicons name="business" size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.bankDetails}>
                                <Text style={styles.bankName}>{virtualAccount.bankName}</Text>
                                <Text style={styles.accountName}>{virtualAccount.accountName}</Text>
                            </View>
                        </View>

                        <View style={styles.accountNumberContainer}>
                            <Text style={styles.accountNumberLabel}>Account Number</Text>
                            <View style={styles.accountNumberRow}>
                                <Text style={styles.accountNumber}>{virtualAccount.accountNumber}</Text>
                                <TouchableOpacity
                                    style={styles.copyButton}
                                    onPress={() => copyToClipboard(virtualAccount.accountNumber, "Account Number")}
                                >
                                    <Ionicons name="copy-outline" size={20} color={Colors.primary} />
                                    <Text style={styles.copyText}>Copy</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.card, styles.emptyCard]}
                        onPress={() => router.push("/virtualAccount")}
                    >
                        <Ionicons name="add-circle-outline" size={32} color={Colors.primary} />
                        <Text style={styles.emptyCardTitle}>Create Virtual Account</Text>
                        <Text style={styles.emptyCardSubtitle}>
                            You don't have a virtual account yet. Tap here to generate one to easily fund your wallet.
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Alternative Funding</Text>

                {/* Monnify Option */}
                <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => setShowMonnifyModal(true)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: "#FFF0E6" }]}>
                        <Ionicons name="card" size={24} color="#FF6600" />
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Card Payment</Text>
                        <Text style={styles.optionDescription}>Fund instantly using your ATM card via Monnify.</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
            </ScrollView>

            {/* Monnify Modal */}
            <Modal
                animationType="fade"
                transparent
                visible={showMonnifyModal}
                onRequestClose={() => setShowMonnifyModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowMonnifyModal(false)}
                />
                <View style={styles.modalContent}>
                    <View style={styles.modalDragIndicator} />
                    <Text style={styles.modalTitle}>Fund via Card</Text>
                    <Text style={styles.modalSubtitle}>Enter the amount you wish to add to your wallet.</Text>

                    <Input
                        placeholder="Amount (e.g. 1000)"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />

                    <Button
                        title={"Continue to Deposit"}
                        onPress={handleMonnifyContinue}
                        style={styles.modalButton}
                        isDisabled={!amount || Number(amount) <= 0}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.textPrimary,
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 20,
        lineHeight: 20,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    emptyCard: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 30,
        borderStyle: "dashed",
        borderColor: Colors.primary,
        borderWidth: 1.5,
        backgroundColor: `${Colors.primary}05`,
    },
    emptyCardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.primary,
        marginTop: 12,
        marginBottom: 8,
    },
    emptyCardSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: "center",
        paddingHorizontal: 20,
        lineHeight: 18,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    bankIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: `${Colors.primary}15`,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    bankDetails: {
        flex: 1,
    },
    bankName: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    accountName: {
        fontSize: 13,
        color: Colors.textSecondary,
        textTransform: "uppercase",
    },
    accountNumberContainer: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 16,
    },
    accountNumberLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        fontWeight: "600",
        marginBottom: 8,
    },
    accountNumberRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    accountNumber: {
        fontSize: 24,
        fontWeight: "800",
        color: Colors.textPrimary,
        letterSpacing: 1,
    },
    copyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: `${Colors.primary}15`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    copyText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: "600",
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 32,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#F3F4F6",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    modalDragIndicator: {
        width: 40,
        height: 5,
        backgroundColor: "#E5E7EB",
        borderRadius: 3,
        alignSelf: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButton: {
        marginTop: 24,
    },
});
