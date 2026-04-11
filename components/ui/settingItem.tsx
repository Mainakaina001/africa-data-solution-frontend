import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SettingItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    disabled?: boolean;
};

export default function SettingItem({
    icon,
    title,
    subtitle,
    onPress,
    rightIcon = "chevron-forward",
    disabled = false,
}: SettingItemProps) {
    return (
        <TouchableOpacity
            style={[styles.settingRow, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={20} color={Colors.background} />
            </View>

            <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && (
                    <Text style={styles.settingSubtitle}>{subtitle}</Text>
                )}
            </View>

            <Ionicons
                name={rightIcon}
                size={20}
                color={disabled ? "#ccc" : Colors.primary}
            />
        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({
    settingRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.background,
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },

    disabled: {
        opacity: 0.5,
    },

    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    settingText: {
        flex: 1,
    },

    settingTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.textPrimary,
    },

    settingSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
});
