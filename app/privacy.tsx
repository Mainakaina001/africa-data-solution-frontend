import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Privacy() {
    return (
        <ScrollView style={styles.container}>
            {/* Headre  */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/legal")} >
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.text}>Privacy Policy</Text>
            </View>
            <View style={styles.body}>
                <Text>

                </Text>

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
    }
})