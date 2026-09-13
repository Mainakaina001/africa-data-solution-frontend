import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotificationScreen() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>
            <Button title={"Mark all as read"} onPress={() => console.log("Submit button pressed")} />
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.background,
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 8,
        flex: 1
    },
    header: {
        flexDirection: "row",
        paddingTop: 28,
        alignItems: "center",
        marginBottom: 16,
    },
    backButton: {
        padding: 6,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "700",
        flex: 1,
        textAlign: "center",
        color: Colors.textPrimary,
    }
});