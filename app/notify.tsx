import SettingSwitch from "@/components/ui/switch"
import { Colors } from "@/constants/colors"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function Notify() {
    const [notification, setNotification] = useState(false);
    const [emailNotification, setEmailNotification] = useState(false);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    Notification
                </Text>
            </View>
            <View>

                <SettingSwitch icon="notifications-outline" title={"Push Notification"} value={notification} onValueChange={setNotification} />
                <SettingSwitch icon="mail-outline" title="Email Notification" value={emailNotification} onValueChange={setEmailNotification} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        backgroundColor: Colors.background
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 16,
    }
    ,
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 22,
        color: Colors.textPrimary
    }
})