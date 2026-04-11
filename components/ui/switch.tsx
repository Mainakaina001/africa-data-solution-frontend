// import { Colors } from "@/constants/colors";
// import { Ionicons } from "@expo/vector-icons";
// import { useState } from "react";
// import { Switch as RNSwitch, StyleSheet, Text, View } from "react-native";

// export default function Switch() {
//     const [isDarkMode, setIsDarkMode] = useState(false);
//     return (
//         <View style={styles.settingRow}>
//             <View style={styles.iconBox}>
//                 <Ionicons name="moon-outline" size={20} color="#555" />
//             </View>

//             <View style={styles.settingText}>
//                 <Text style={styles.settingTitle}>Dark Mode</Text>
//                 <Text style={styles.settingSubtitle}>
//                     Switch app display mode to your preference
//                 </Text>
//             </View>

//             <RNSwitch
//                 value={isDarkMode}
//                 onValueChange={(val) => setIsDarkMode(val)}
//                 thumbColor={Colors.primary}
//                 trackColor={{ false: '#ccc', true: Colors.primary }} />
//         </View>
//     )
// }

import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Switch as RNSwitch, StyleSheet, Text, View } from "react-native";

type SettingSwitchProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
};

export default function SettingSwitch({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
}: SettingSwitchProps) {
    return (
        <View style={styles.settingRow}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={20} color={Colors.background} />
            </View>

            <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && (
                    <Text style={styles.settingSubtitle}>{subtitle}</Text>
                )}
            </View>

            <RNSwitch
                value={value}
                onValueChange={onValueChange}
                thumbColor={Colors.primary}
                trackColor={{ false: "#ccc", true: Colors.primary }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },

    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    settingSubtitle: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
})
