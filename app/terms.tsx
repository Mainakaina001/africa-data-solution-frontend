import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Section = {
    heading: string;
    body: string;
};

const SECTIONS: Section[] = [
    {
        heading: "1. Acceptance of Terms",
        body: "By downloading, registering, or using Africa Data Solutions (the \"App\") or any of its services, you agree to be bound by these Terms of Service (\"Terms\").\n\nIf you do not agree to these Terms, please do not use the App or its services. Your continued use of the App after any updates to these Terms will constitute your acceptance of the updated Terms.",
    },
    {
        heading: "2. Eligibility",
        body: "You must be at least 18 years old to create an account and use our services.\n\nBy creating an account, you confirm that you are at least 18 years old and that all information you provide during registration is accurate, complete, and truthful.\n\nAfrica Data Solutions reserves the right to suspend or terminate any account found to be operated by a person under the minimum age requirement.",
    },
    {
        heading: "3. Account Registration",
        body: "To use most of our services, you must create an account by providing accurate and complete information.\n\nYou are responsible for:\n\n• Maintaining the confidentiality of your account login credentials.\n• All activities that occur under your account.\n• Notifying us immediately of any unauthorised access or use of your account.\n\nAfrica Data Solutions will not be liable for any loss or damage arising from your failure to protect your account credentials.",
    },
    {
        heading: "4. Our Services",
        body: "Africa Data Solutions provides a platform for purchasing mobile data bundles, airtime top-ups, bill payments (electricity, cable TV, education, and other utilities), and related digital services.\n\nAll services are provided subject to availability. We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.\n\nService fees and prices may change from time to time. Current prices are displayed in the App at the time of each transaction.",
    },
    {
        heading: "5. Payments and Transactions",
        body: "All transactions are processed in Nigerian Naira (NGN) unless otherwise stated.\n\nBy making a payment, you authorise Africa Data Solutions to charge your wallet or linked payment method for the amount due.\n\nAll transactions are subject to verification. We reserve the right to reverse, cancel, or hold any transaction that is suspected to be fraudulent, erroneous, or in violation of these Terms.\n\nOnce a transaction is processed and confirmed, it is generally non-refundable except in cases of proven service failure caused by Africa Data Solutions.",
    },
    {
        heading: "6. Wallet",
        body: "Africa Data Solutions provides a wallet feature that allows you to fund your account balance and use it for purchases.\n\nWallet funds:\n\n• Cannot be withdrawn to a bank account unless explicitly supported.\n• Cannot be transferred to another user unless such a feature is offered.\n• Are subject to the terms and conditions of this agreement.\n\nWe are not a bank or licensed financial institution. Wallet balances do not earn interest.",
    },
    {
        heading: "7. Transaction PIN",
        body: "A 6-digit transaction PIN is required to authorise sensitive account actions and financial transactions.\n\nYou are solely responsible for keeping your transaction PIN confidential. Never share your PIN with anyone, including Africa Data Solutions support staff.\n\nIf you suspect your PIN has been compromised, please change it immediately from the Security settings section of the App.",
    },
    {
        heading: "8. Prohibited Activities",
        body: "You agree not to use our services to:\n\n• Engage in fraudulent, deceptive, or misleading activities.\n• Launder money or facilitate illegal financial transactions.\n• Purchase services for others in violation of applicable law.\n• Use automated tools, bots, or scripts to access our platform.\n• Attempt to hack, compromise, or disrupt our systems.\n• Impersonate another user or person.\n• Violate any applicable local or international law or regulation.\n\nViolation of these prohibitions may result in immediate account suspension or termination and may be reported to relevant authorities.",
    },
    {
        heading: "9. Intellectual Property",
        body: "All content, trademarks, logos, software, and intellectual property in the App belong to Africa Data Solutions or its licensors.\n\nYou may not copy, reproduce, distribute, modify, or create derivative works from any part of the App without our express written permission.",
    },
    {
        heading: "10. Limitation of Liability",
        body: "To the maximum extent permitted by applicable law, Africa Data Solutions shall not be liable for:\n\n• Loss of data or profits.\n• Interruption of service.\n• Indirect, incidental, or consequential damages.\n• Any damages arising from third-party service failures (e.g., network providers, payment gateways).\n\nOur total liability for any claim arising from these Terms or the use of our services shall not exceed the amount paid by you for the relevant transaction.",
    },
    {
        heading: "11. Disclaimer of Warranties",
        body: "Our services are provided on an \"as is\" and \"as available\" basis without warranties of any kind, express or implied.\n\nWe do not guarantee that:\n\n• The App will always be available or error-free.\n• Services will be delivered without delay from third-party providers.\n• Results from using our services will meet your expectations.\n\nWe are not responsible for the availability, reliability, or quality of third-party networks (e.g., mobile operators) whose services are fulfilled through our platform.",
    },
    {
        heading: "12. Termination",
        body: "We reserve the right to suspend or terminate your account at any time, with or without notice, if we believe you have violated these Terms or engaged in fraudulent or harmful activity.\n\nYou may also close your account at any time by contacting our support team. Upon termination, your access to our services will cease immediately.",
    },
    {
        heading: "13. Changes to These Terms",
        body: "Africa Data Solutions may update these Terms from time to time. When we make significant changes, we will notify you via the App or other communication channels.\n\nYour continued use of the App after changes take effect means you accept the updated Terms.",
    },
    {
        heading: "14. Governing Law",
        body: "These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.\n\nAny disputes arising from these Terms or the use of our services shall be subject to the exclusive jurisdiction of Nigerian courts, unless otherwise agreed by both parties.",
    },
    {
        heading: "15. Contact Us",
        body: "If you have any questions or concerns about these Terms, please contact us:\n\nEmail: africadatasupport@gmail.com\nWebsite: www.africadatasolutions.org\nWhatsApp: 08160604894",
    },
];

export default function Terms() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.body}>
                <View style={styles.intro}>
                    <Text style={styles.docTitle}>Africa Data Solutions — Terms of Service</Text>
                    <Text style={styles.lastUpdated}>Last Updated: September 2026</Text>
                    <Text style={styles.introParagraph}>
                        Please read these Terms of Service carefully before using the Africa Data Solutions app or any of our services. By using our platform, you agree to be legally bound by these terms.
                    </Text>
                </View>

                {SECTIONS.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionHeading}>{section.heading}</Text>
                        <Text style={styles.sectionBody}>{section.body}</Text>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Africa Data Solutions — By using our platform you agree to these terms. Thank you for trusting us with your digital service needs.
                    </Text>
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
        paddingTop: 30,
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
    body: {
        gap: 20,
    },
    intro: {
        backgroundColor: "#FFF8E1",
        borderRadius: 14,
        padding: 16,
        gap: 6,
        borderLeftWidth: 4,
        borderLeftColor: "#FFA000",
    },
    docTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    lastUpdated: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 6,
    },
    introParagraph: {
        fontSize: 14,
        color: Colors.textPrimary,
        lineHeight: 22,
    },
    section: {
        gap: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
    },
    sectionHeading: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    sectionBody: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    footer: {
        marginTop: 8,
        padding: 14,
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
    },
    footerText: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: "center",
        fontStyle: "italic",
        lineHeight: 20,
    },
});