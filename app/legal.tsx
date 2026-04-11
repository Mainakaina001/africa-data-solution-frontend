import { Colors } from "@/constants/colors"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function Legal() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Header  */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.push("/account")}>
                        <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>

                    <Text style={styles.headerText}>Legal</Text>
                </View>


                <View style={styles.body}>
                    <TouchableOpacity style={styles.item} onPress={() => router.push("/terms")}>
                        <View style={styles.itemLeft}>
                            <Ionicons name="document-text-outline" size={24} color={Colors.primary} />
                            <Text style={styles.itemText}>Terms of Service</Text>
                        </View>

                        <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.item} onPress={() => router.push("/privacy")}>
                        <View style={styles.itemLeft}>
                            <Ionicons name="shield-checkmark-outline" size={24} color={Colors.primary} />
                            <Text style={styles.itemText}>Privacy Policy</Text>
                        </View>

                        <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
                    </TouchableOpacity>

                </View>
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
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        flex: 1,
    },
    content: {
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
    body: {
        flex: 1,
        gap: 24,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "600",
        color: Colors.textPrimary,
        marginLeft: 12,
    },

    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: Colors.background,
        borderRadius: 12,
    },

    itemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    itemText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: "500",
    },


})