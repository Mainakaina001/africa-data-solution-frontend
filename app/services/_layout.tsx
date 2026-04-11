import { Stack } from 'expo-router';

export default function ServicesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[type]" options={{ headerShown: false }} />
            <Stack.Screen name="confirm" options={{ headerShown: false }} />
        </Stack>
    );
}
