import { message, createDataItemSigner } from "@permaweb/aoconnect";

export default async function ticklePlayers(gameState) {
    // Check if gameState and gameState.Players exist
    if (!gameState || !gameState.Players) {
        console.log("No game state or players to process.");
        return;
    }

    // Iterate over the player IDs in the gameState.Players object
    for (const playerId in gameState.Players) {
       
        await message({
            process: playerId,
            tags: [
                {name: "Action", value: "Tick"}
            ],
            signer: createDataItemSigner(window.arweaveWallet),
        }).catch(console.error)
    }
    console.log("Finished tickling players.");
}
