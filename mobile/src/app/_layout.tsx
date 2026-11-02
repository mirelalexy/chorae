import { BricolageGrotesque_400Regular, 
	     BricolageGrotesque_500Medium, 
		 BricolageGrotesque_600SemiBold, 
		 BricolageGrotesque_800ExtraBold 
	    } from "@expo-google-fonts/bricolage-grotesque";
import { colors } from "@/theme";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "react-native";
import { useFonts } from 'expo-font';
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/auth/AuthProvider";

// Keep the splash screen up until the fonts are ready so text never appears in the wrong font.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		BricolageGrotesque_400Regular,
    	BricolageGrotesque_500Medium,
    	BricolageGrotesque_600SemiBold,
    	BricolageGrotesque_800ExtraBold,
	});

	if (!fontsLoaded && !fontError) return null;
	
	return (
		<AuthProvider>
			<StatusBar barStyle="light-content" />
			<RootNavigator />
		</AuthProvider>
  	);
}

function RootNavigator() {
	const { status } = useAuth();

	useEffect(() => {
		if (status !== "loading") SplashScreen.hideAsync();
	}, [status]);

	if (status === "loading") return null;
	const signedIn = status === "signedIn";

	return (
		<Stack screenOptions={{
			headerShown: false,
			contentStyle: { backgroundColor: colors.background },
		}}>
			<Stack.Protected guard={signedIn} redirectTo="/sign-up">
				<Stack.Screen name="index" />
			</Stack.Protected>

			<Stack.Protected guard={!signedIn}>
				<Stack.Screen name="sign-up" />
				<Stack.Screen name="log-in" />
			</Stack.Protected>
		</Stack>
	);
}
