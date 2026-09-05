import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

const SUPPORT_CHANNELS = {
    whatsappGroup: "https://whatsapp.com/ILRp0GBQraT1URbRSJT5vu",
    whatsappChat: "https://wa.me/2348160604894",
    email: "mailto:africadatasupport@gmail.com",
    website: "https://www.africadatasolutions.org/",
    phoneNumber: "08160604894",
};

export default function Support() {
    const handleOpenUrl = async (url: string, label: string) => {
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
            } else {
                await Linking.openURL(url);
            }
        } catch {
            Toast.show({
                type: "error",
                text1: "Unable to Open Link",
                text2: `Could not open ${label}. Please try again later.`,
            });
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header  */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Support</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.logoWrap}>
                <Image
                    source={require("../assets/images/datalog.png")}
                    style={styles.image}
                />
            </View>

            <View style={styles.body}>
                <View style={styles.introBox}>
                    <Text style={styles.introTitle}>How can we assist you today?</Text>
                    <Text style={styles.introText}>
                        Our dedicated support team is here to help with any inquiries, transaction issues, or questions regarding Africa Data Solutions.
                    </Text>
                </View>

                {/* 2x2 Support Cards Grid */}
                <View style={styles.grid}>
                    {/* WhatsApp Group */}
                    <TouchableOpacity
                        style={styles.supportCard}
                        onPress={() => handleOpenUrl(SUPPORT_CHANNELS.whatsappGroup, "WhatsApp Group")}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: "#E8F5E9" }]}>
                            <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
                        </View>
                        <Text style={styles.cardTitle}>WhatsApp Community</Text>
                        <Text style={styles.cardSubtitle}>Join group updates</Text>
                        <Text style={styles.cardAction}>Join Now →</Text>
                    </TouchableOpacity>

                    {/* WhatsApp Direct Chat */}
                    <TouchableOpacity
                        style={styles.supportCard}
                        onPress={() => handleOpenUrl(SUPPORT_CHANNELS.whatsappChat, "WhatsApp Support")}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: "#E1F5FE" }]}>
                            <Ionicons name="chatbubbles" size={28} color={Colors.primary} />
                        </View>
                        <Text style={styles.cardTitle}>WhatsApp Chat</Text>
                        <Text style={styles.cardSubtitle}>{SUPPORT_CHANNELS.phoneNumber}</Text>
                        <Text style={styles.cardAction}>Chat Now →</Text>
                    </TouchableOpacity>

                    {/* Email Support */}
                    <TouchableOpacity
                        style={styles.supportCard}
                        onPress={() => handleOpenUrl(SUPPORT_CHANNELS.email, "Support Email")}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: "#FFF3E0" }]}>
                            <Ionicons name="mail" size={28} color="#FF9800" />
                        </View>
                        <Text style={styles.cardTitle}>Email Support</Text>
                        <Text style={styles.cardSubtitle}>africadatasupport@gmail.com</Text>
                        <Text style={styles.cardAction}>Send Email →</Text>
                    </TouchableOpacity>

                    {/* Official Website */}
                    <TouchableOpacity
                        style={styles.supportCard}
                        onPress={() => handleOpenUrl(SUPPORT_CHANNELS.website, "Official Website")}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: "#EDE7F6" }]}>
                            <Ionicons name="globe-outline" size={28} color="#673AB7" />
                        </View>
                        <Text style={styles.cardTitle}>Our Website</Text>
                        <Text style={styles.cardSubtitle}>africadatasolutions.org</Text>
                        <Text style={styles.cardAction}>Visit Site →</Text>
                    </TouchableOpacity>
                </View>
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
        paddingTop: 36,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
    },
    logoWrap: {
        alignItems: "center",
        marginVertical: 12,
    },
    image: {
        width: 140,
        height: 60,
        resizeMode: "contain",
    },
    body: {
        gap: 20,
    },
    introBox: {
        gap: 8,
        backgroundColor: "#F8F9FA",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#EEEEEE",
    },
    introTitle: {
        color: Colors.textPrimary,
        fontSize: 17,
        fontWeight: "700",
    },
    introText: {
        color: Colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
    },
    supportCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F0F0F0",
        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        // Android shadow
        elevation: 2,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    cardTitle: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 4,
    },
    cardSubtitle: {
        color: Colors.textSecondary,
        fontSize: 12,
        textAlign: "center",
        marginBottom: 8,
    },
    cardAction: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: "600",
    },
});