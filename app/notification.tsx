import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ForgotPassword() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="chevron-back" size={20} color={Colors.primary} />
                <Text style={styles.headerText}>Notifications</Text>
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
        // flex: 1,
        alignItems: "center",
    },
    headerText: {
        fontSize: 16,
        flex: 1,
        textAlign: "center"
    }
})