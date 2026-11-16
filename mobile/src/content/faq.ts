// Every answer describes what the app does today: update an answer when the feature it talks about changes.
export const FAQ = [
    {
        title: "Rae",
        questions: [
            {
                question: "Does Rae create the music?",
                answer: "Rae doesn't generate music. She curates existing songs by real artists, choosing tracks that fit your idea and arranging them into a mixtape.",
            },
            {
                question: "Why did Rae leave out a song I asked for?",
                answer: "Rae suggests real songs, and Chorae checks them against MusicBrainz before saving your tape. If a song can't be matched, it is left out.",
            },
            {
                question: "Why does Rae ask questions?",
                answer: "Because the same idea can mean different things to different people. Rae's questions help narrow down the mood, direction, and details before she starts choosing songs.",
            },
            {
                question: "How does Rae use my music taste?",
                answer: "She doesn't yet, but Rae will use the artists and albums you've selected to help guide her recommendations. They will be a starting point, not a rule that limits what she can choose.",
            },
        ],
    },
    {
        title: "Making tapes",
        questions: [
            {
                question: "How many tapes can I make?",
                answer: "You can make up to 5 tapes within 24 hours. Each slot becomes available again 24 hours after a tape got generated, rather than all resetting at once. You can always check how many you have left before talking to Rae.",
            },
            {
                question: "What happens if making a tape fails?",
                answer: "You can try again from the same screen. If it fails before Rae started writing to it, it doesn't count as a complete tape. Your limit stays the same.",
            },
            {
                question: "What are tape stories?",
                answer: "Story mode gives your tape a narrative arc. Rae organizes the songs into sides, taking you from one part of the story to the next.",
            },
        ],
    },
    {
        title: "Your tapes",
        questions: [
            {
                question: "Can I listen to my tapes in Chorae?",
                answer: "Not directly. Chorae is a place to discover and curate music, not a streaming service. Listening integrations are planned for the future.",
            },
            {
                question: "Can I rename a tape or change its cover?",
                answer: "Yes. Open the tape and tap the pencil at the top. You can rename it, choose a cover of your own, or go back to its original album grid.",
            },
            {
                question: "Does deleting a tape give me one back?",
                answer: "No. A deleted tape still counts as something Rae worked on and does add up to your limit.",
            },
            {
                question: "Who can see my tapes and my taste?",
                answer: "Only you. Sharing features aren't available yet.",
            },
        ],
    },
];