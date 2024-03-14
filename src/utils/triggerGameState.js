import { message, createDataItemSigner } from "@permaweb/aoconnect";

export default async function triggerGameState(){
  const messageID =  await message({

        process: "gG-uz2w6qCNYWQGwocOh225ccJMj6fkyGDSKDS2K_nk",
        tags: [
          { name: "Action", value: "GetGameState" },
        ],

        signer: createDataItemSigner(window.arweaveWallet),
      })
        .catch(console.error);

const tickID = await message({

    process: "gG-uz2w6qCNYWQGwocOh225ccJMj6fkyGDSKDS2K_nk",
    tags: [
      { name: "Action", value: "Tick" },
    ],

    signer: createDataItemSigner(window.arweaveWallet),
  })
    .catch(console.error);
    };