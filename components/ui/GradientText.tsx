import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, Text, TextStyle } from 'react-native';

interface GradientTextProps {
    children: React.ReactNode;
    colors?: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    style?: StyleProp<TextStyle>;
}

export function GradientText({
    children,
    colors = ['#FF0000', '#990000'],
    start = { x: 0, y: 0 },
    end = { x: 1, y: 0 },
    style,
}: GradientTextProps) {
    return (
        <MaskedView maskElement={<Text style={style}>{children}</Text>}>
            <LinearGradient colors={colors as any} start={start} end={end}>
                <Text style={[style, { opacity: 0 }]}>{children}</Text>
            </LinearGradient>
        </MaskedView>
    );
}
