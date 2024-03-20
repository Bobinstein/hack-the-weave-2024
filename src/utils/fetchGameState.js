import { results } from "@permaweb/aoconnect";
import triggerGameState from "./triggerGameState";

export const fetchGameState = async (setGameState, setAnnouncements, setTimeRemaining, gameState, announcements = []) => {
    // await triggerGameState();
    const gameResults = await results({
        process: "0rVZYFxvfJpO__EfOz0_PUQ3GFE9kEaES0GkUDNXjvE",
        sort: "DESC",
        limit: 25,
    });

    
    const gameStateMessages = gameResults.edges.flatMap(
        (edge) => edge.node.Messages
    );

    const gameStateMessage = gameStateMessages.find((message) =>
        message.Tags.some(
            (tag) => tag.name === "Action" && tag.value === "GameState"
        )
    );

    if (gameStateMessage) {
        const stateData = JSON.parse(gameStateMessage.Data);
        console.log("Game state fetched:", stateData);
        if (!gameState || stateData.TimeRemaining > gameState.TimeRemaining) {
            setGameState(stateData);
            setTimeRemaining(stateData.TimeRemaining / 1000);
        }
    }
// console.log("gameResults: ", gameResults)
    const newAnnouncements = gameStateMessages
        .filter((message) =>
            message.Tags.some(
                (tag) => tag.name === "Action" && tag.value === "Announcement"
            )
        )
        .map((message) => message.Data)
        .filter(
            (announcement) =>
                !announcements.includes(announcement) &&
                !announcement.includes("The game will end in") &&
                !announcement.includes("The game will begin in")
        );
// console.log("announcements: ", gameStateMessage)
    // Ensure announcements is always an array to prevent undefined error
    const combinedAnnouncements = Array.from(
        new Set([...(announcements || []), ...newAnnouncements])
    );
    const uniqueAnnouncements = combinedAnnouncements.slice(-10).reverse();

    setAnnouncements(uniqueAnnouncements);
};
