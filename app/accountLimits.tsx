import { Button } from "@/components/ui/button"
import { Colors } from "@/constants/colors"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function AccountLimits() {
    return (
        <><ScrollView style={{ backgroundColor: Colors.background, flex: 1, paddingTop: 30, padding: 16 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/(tabs)/account")}>
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.text}>Account Limits</Text>
            </View>
            <Button title="Upgrade Limits" onPress={() => { }} />
        </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
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

})