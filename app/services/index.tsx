import { Redirect } from 'expo-router';

export default function ServicesIndex() {
    // Redirect to dashboard if someone lands on /services directly
    return <Redirect href="/(tabs)" />;
}
