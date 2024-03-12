import { message, createDataItemSigner } from "@permaweb/aoconnect";

export default async function(process, lua){
  const messageID =  await message({
        /*
        The arweave TXID of the process, this will become the "target".
        This is the process the message is ultimately sent to.
      */
        process: process,
  
        // Tags that the process will use as input.
        tags: [
          { name: "Action", value: "Eval" },
          //   { name: "Another-Tag", value: "another-value" },
        ],
        // // A signer function used to build the message "signature"
        signer: createDataItemSigner(window.arweaveWallet),
        /*
        The "data" portion of the message.
        If not specified a random string will be generated
      */
        data: lua,
      })
        .then(console.log)
        .catch(console.error);

        return messageID
    };
