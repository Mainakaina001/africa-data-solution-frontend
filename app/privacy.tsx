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
        heading: "1. Information We Collect",
        body: "We may collect information that you provide when you register, contact us, make a purchase, or use our services. This may include your name, phone number, email address, payment information, and other information needed to provide our services.\n\nWe may also collect basic information about how you use our website or services, such as your device information, IP address, browser type, and activity on our platform.",
    },
    {
        heading: "2. How We Use Your Information",
        body: "We may use your information to:\n\n• Provide and improve our services.\n• Process your orders and payments.\n• Communicate with you about your account or transactions.\n• Provide customer support.\n• Send important service updates and notifications.\n• Prevent fraud, abuse, and unauthorized activities.\n• Improve the security and performance of our platform.\n• Comply with applicable laws and legal requirements.\n\nWe will only use your information for legitimate business purposes and in a way that is consistent with this Privacy Policy.",
    },
    {
        heading: "3. Sharing of Personal Information",
        body: "We do not sell your personal information to other people or companies.\n\nHowever, we may share necessary information with trusted service providers who help us operate our business, such as payment processors, hosting providers, technology providers, or customer support services.\n\nWe may also disclose your information when required by law, court order, or a valid request from a government authority, or when we believe it is necessary to:\n\n• Comply with a legal obligation.\n• Protect the rights or property of Africa Data Solutions.\n• Prevent or investigate fraud, abuse, or other wrongdoing.\n• Protect the safety of our users or the public.\n• Protect Africa Data Solutions from legal claims or liability.",
    },
    {
        heading: "4. Security of Your Information",
        body: "We take reasonable steps to protect your personal information from unauthorized access, loss, misuse, alteration, or disclosure.\n\nHowever, no method of storing or transmitting information over the internet is completely secure. Therefore, while we work to protect your information, we cannot guarantee 100% security.",
    },
    {
        heading: "5. Data Retention",
        body: "We keep your personal information only for as long as it is reasonably necessary to provide our services, maintain business records, meet legal requirements, resolve disputes, and protect our business.\n\nWhen your information is no longer needed, we may securely delete or remove it.",
    },
    {
        heading: "6. Children's Privacy",
        body: "Our services are not intended for children under the age of 13.\n\nWe do not knowingly collect personal information from children under 13. If we discover that we have collected such information without the required parental consent, we will take reasonable steps to remove it.\n\nIf your country requires parental consent before collecting information from a child, we will follow the applicable requirements.",
    },
    {
        heading: "7. Cookies and Similar Technologies",
        body: "Africa Data Solutions may use cookies and similar technologies to improve the performance of our website, remember user preferences, understand how our services are used, and improve your experience.\n\nYou may be able to control or disable cookies through your browser settings. However, disabling some cookies may affect how certain parts of our services work.",
    },
    {
        heading: "8. Third-Party Services and Websites",
        body: "Our services may contain links to websites or services operated by third parties.\n\nIf you click on a third-party link, you will be taken to a website that is not controlled by Africa Data Solutions. We encourage you to read the privacy policy of any third-party website you visit.\n\nAfrica Data Solutions is not responsible for the content, security, or privacy practices of third-party websites.",
    },
    {
        heading: "9. Your Privacy Rights",
        body: "Depending on applicable laws, you may have the right to:\n\n• Ask what personal information we hold about you.\n• Request correction of incorrect information.\n• Request deletion of your personal information where legally allowed.\n• Withdraw consent where processing is based on consent.\n• Ask questions about how your information is being used.\n\nTo make a privacy request, you can contact us using the details provided below.",
    },
    {
        heading: "10. Changes to This Privacy Policy",
        body: "Africa Data Solutions may update this Privacy Policy from time to time to reflect changes in our services, business practices, or legal requirements.\n\nWhen we make important changes, we may notify you by posting the updated policy on our website or through other appropriate communication channels.\n\nWe encourage you to review this Privacy Policy from time to time so you remain informed about how we protect your information.",
    },
    {
        heading: "11. Contact Us",
        body: "If you have any questions, concerns, or requests about this Privacy Policy or how we handle your personal information, please contact us:\n\nEmail: africadatasupport@gmail.com\nWebsite: www.africadatasolutions.org\nWhatsApp: 08160604894",
    },
];

export default function Privacy() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.body}>
                <View style={styles.intro}>
                    <Text style={styles.docTitle}>AfricaData Solutions Privacy Policy</Text>
                    <Text style={styles.lastUpdated}>Last Updated: September 2026</Text>
                    <Text style={styles.introParagraph}>
                        At Africa Data Solutions, we respect your privacy and take the protection of your personal information seriously. This Privacy Policy explains how we collect, use, protect, and handle your information when you use our website, app, or services.
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
                        Africa Data Solutions — We value your privacy and are committed to handling your information responsibly.
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
        backgroundColor: "#F0F6FF",
        borderRadius: 14,
        padding: 16,
        gap: 6,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
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