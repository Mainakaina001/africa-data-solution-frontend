import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Support() {
    return (
        <ScrollView style={styles.container}>
            {/* Header  */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/account")} >
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.text}>Support</Text>
            </View>
            <View>
                <Image
                    source={require("../assets/images/datalog.png")}
                    style={styles.image}
                />
            </View>
            <View style={styles.body}>
                <View style={{ gap: 16 }}>

                    <Text style={styles.text1}>

                        What assistance can we offer you today? Our support team is here to help with any questions or issues you may have regarding our services. Please feel free to reach out to us through the following channels:
                    </Text>
                    <Text style={styles.text2}>We are dedicated to providing you with the best support possible. If you have any questions, concerns, or need further assistance, please don't hesitate to contact us.</Text>
                </View>

                <View style={styles.body2}>
                    <TouchableOpacity style={styles.supportCard}>
                        <Image
                            source={require("../assets/images/whatsapp.png")}
                            style={styles.cardImage}
                        />
                        <Text style={styles.text3}>WhatsApp Group</Text>
                        <Text style={styles.text4}>Join now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.supportCard}>
                        <Image
                            source={require("../assets/images/datalog.png")}
                            style={styles.cardImage}
                        />
                        <Text style={styles.text3}>Our Website</Text>
                        <Text style={styles.text4}>Visit Now</Text>
                    </TouchableOpacity>
                </View>

                {/* <View style={styles.body2}>

                    <View style={styles.supportImag}>
                        <Image
                            source={require("../assets/images/whatsapp.png")}
                            style={styles.image}
                        />
                        <Text style={styles.text3}>
                            WhatsApp Group
                        </Text>
                        <Text style={styles.text4}>
                            join now
                        </Text>
                    </View>
                    <View style={styles.supportImag}>
                        <Image
                            source={require("../assets/images/datalog.png")}
                            style={styles.image}
                        />
                        <Text style={styles.text3}>
                            Our Website
                        </Text>
                        <Text style={styles.text4}>
                            Visit Now
                        </Text>
                    </View>
                </View> */}
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        flex: 1,
        padding: 16,
        paddingTop: 30,
    },
    header: {
        backgroundColor: Colors.background,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    image: {
        width: '100%',
        height: 100,
        resizeMode: 'contain',
        marginVertical: 20,
    },
    body: {
        flex: 1,
        gap: 24,
    },
    text: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: "600",
        flex: 1,
        textAlign: "center",
    },
    text1: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: "400",
    },
    text2: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: "400",
        marginTop: 10,
    },
    body2: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,

    },
    supportImag: {
        borderRadius: 8,
        alignItems: "center",
        gap: 12,
    },
    text3: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: "600",
    },
    text4: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: "500",
    },

    supportCard: {
        width: "48%",
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        gap: 10,

        // iOS shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },

    cardImage: {
        width: 50,
        height: 50,
        resizeMode: "contain",
        marginBottom: 6,
    },


})