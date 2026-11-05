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
	const { status, onboarding } = useAuth();

	useEffect(() => {
		if (status !== "loading") SplashScreen.hideAsync();
	}, [status]);

	if (status === "loading") return null;
	const signedIn = status === "signedIn";

	const home = !signedIn ? "/log-in" : onboarding ? "/onboarding/artists" : "/";

	return (
		<Stack screenOptions={{
			headerShown: false,
			contentStyle: { backgroundColor: colors.background },
		}}>
			{/* Logged out: sign up/log in. */}
			<Stack.Protected guard={!signedIn} redirectTo={home}>
				<Stack.Screen name="sign-up" />
				<Stack.Screen name="log-in" />
			</Stack.Protected>

			{/* Just signed up: onboarding until finished or skipped. */}
			<Stack.Protected guard={signedIn && onboarding} redirectTo={home}>
				<Stack.Screen name="onboarding/artists" />
				<Stack.Screen name="onboarding/albums" />
			</Stack.Protected>

			{/* Logged in: home. */}
			<Stack.Protected guard={signedIn && !onboarding} redirectTo={home}>
				<Stack.Screen name="(tabs)" />
				{/* Create new tape sheet. */}
				<Stack.Screen 
					name="new-tape"
					options={{
						presentation: "formSheet",
						sheetAllowedDetents: "fitToContents",
						sheetGrabberVisible: false,
						sheetCornerRadius: 28,
						contentStyle: { backgroundColor: "#222025" },
					}}
				/>
				<Stack.Screen name="create" />
				<Stack.Screen name="remake" />
				<Stack.Screen name="jobs/[id]" />
				<Stack.Screen name="mixtapes/[id]" />
			</Stack.Protected>
		</Stack>
	);
}
