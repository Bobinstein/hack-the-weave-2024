import { message, createDataItemSigner } from "@permaweb/aoconnect";

// Pass setLoading as a parameter
export default async function loadLua(process, lua, setIsLoading) {
  setIsLoading(true);
  try {
    const messageID = await message({
      process: process,
      tags: [{ name: "Action", value: "Eval" }],
      signer: createDataItemSigner(window.arweaveWallet),
      data: lua,
    });

    console.log(messageID);
    return messageID;
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false); // Ensure setLoading is called even if there's an error
  }
}
