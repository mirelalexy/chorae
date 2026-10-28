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

// Keep the splash screen up until the fonts are ready so text never appears in the wrong font.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		BricolageGrotesque_400Regular,
    	BricolageGrotesque_500Medium,
    	BricolageGrotesque_600SemiBold,
    	BricolageGrotesque_800ExtraBold,
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded, fontError])

	if (!fontsLoaded && !fontError) return null;
	
	return (
		<>
      		<Stack
    			screenOptions={{
          			contentStyle: {
            			backgroundColor: colors.background,
          			},
        		}}
      		/>
    	</>
  	);
}
