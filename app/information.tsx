import { Button } from "@/components/ui/button";
import { CustomLoader } from "@/components/ui/CustomLoader";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { useGetMeQuery } from "@/store/api/apiSlice";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Information() {
    const { data: profileResponse, isLoading } = useGetMeQuery();
    const user = profileResponse?.data;

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
    });

    useEffect(() => {
        if (user) {
            setForm({
                fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                phone: user.phone || "",
                email: user.email || "",
            });
        }
    }, [user]);

    if (isLoading) {
        return (
            <View style={[style.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <CustomLoader size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={style.container}>
            <View style={style.content}>

                {/* header  */}
                <View style={style.header}>
                    <TouchableOpacity onPress={() => router.push("/(tabs)/account")}>
                        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={style.headerText}>Edit</Text>
                </View>
                <View style={style.body}>
                    <Input
                        placeholder="Full name"
                        value={form.fullName}
                        onChangeText={(text) => setForm({ ...form, fullName: text })}
                    />
                    <Input
                        placeholder="Phone number"
                        value={form.phone}
                        onChangeText={(text) => setForm({ ...form, phone: text })}
                        keyboardType="phone-pad"
                    />
                    <Input
                        placeholder="Email"
                        value={form.email}
                        onChangeText={(text) => setForm({ ...form, email: text })}
                        keyboardType="email-address"
                        editable={false}
                    />
                    <Button title="Submit" onPress={() => { }} />
                </View>
            </View>
        </ScrollView>
    );
}

const style = StyleSheet.create({
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 26,
        padding: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    body: {
        padding: 20,
        gap: 16,

    },
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: 20
    },
    content: {
        flex: 1,
        padding: 16,
        backgroundColor: Colors.background,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textPrimary,
    }
})