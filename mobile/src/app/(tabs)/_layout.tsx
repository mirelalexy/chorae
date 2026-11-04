import { TabList, TabSlot, TabTrigger, Tabs } from "expo-router/ui";
import { GlassBar, TabButton } from "@/components/TabBar";
import { CassetteTapeIcon, HouseIcon, UserIcon } from "@/components/icons";

export default function TabsLayout() {
    return (
        <Tabs>
            <TabSlot />
            <TabList asChild>
                <GlassBar>
                    <TabTrigger name="index" href="/" asChild>
                        <TabButton label="Home" Icon={HouseIcon} />
                    </TabTrigger>
                    <TabTrigger name="tapes" href="/tapes" asChild>
                        <TabButton label="Tapes" Icon={CassetteTapeIcon} />
                    </TabTrigger>
                    <TabTrigger name="you" href="/profile" asChild>
                        <TabButton label="You" Icon={UserIcon} />
                    </TabTrigger>
                </GlassBar>
            </TabList>
        </Tabs>
    );
}