import { message, createDataItemSigner } from "@permaweb/aoconnect";

export default async function triggerGameState(){

    console.log("triggering game state")
  const messageID =  await message({

        process: "0rVZYFxvfJpO__EfOz0_PUQ3GFE9kEaES0GkUDNXjvE",
        tags: [
          { name: "Action", value: "GetGameState" },
        ],

        signer: createDataItemSigner(window.arweaveWallet),
      })
        .catch(console.error);

// const tickID = await message({

//     process: "0rVZYFxvfJpO__EfOz0_PUQ3GFE9kEaES0GkUDNXjvE",
//     tags: [
//       { name: "Action", value: "Tick" },
//     ],

//     signer: createDataItemSigner(window.arweaveWallet),
//   })
//     .catch(console.error);
    };