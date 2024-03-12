// src/pages/process/[id].js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { results } from "@permaweb/aoconnect";
import AoMessages from "../../components/aoMessages";
import { message, createDataItemSigner } from "@permaweb/aoconnect";

const ProcessPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [canLoadMore, setCanLoadMore] = useState(true);

  const lua = `BigTestValue = "doodoobop`;

  const sendMessage = async () => {
    
    // The only 2 mandatory parameters here are process and signer
    await message({
      /*
      The arweave TXID of the process, this will become the "target".
      This is the process the message is ultimately sent to.
    */
      process: "CwoiizB4SRis0EjptFwtiGVHdP6Qzry_6_08zFR4Rhs",

      // anchor: "Dncf48f-E29LtcRlsgpxFaIyBzx86MQrsQfNEZMNkXw",

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
  };

  const fetchResults = async (processId, fromCursor) => {
    const queryOptions = {
      process: processId,
      sort: "DESC",
      limit: 25,
    };

    if (fromCursor) {
      queryOptions.from = fromCursor;
    }

    const resultsOut = await results(queryOptions);
    console.log(resultsOut);
    const filteredMessages = resultsOut.edges
      .map((edge) => edge.node)
      .filter((node) => node.Messages && node.Messages.length > 0);

    setMessages((prev) => [...prev, ...filteredMessages]);
    const newCursor =
      resultsOut.edges?.[resultsOut.edges.length - 1]?.cursor ?? null;
    setCursor(newCursor);

    // Update canLoadMore based on whether we have loaded 100 items and there is still data to load
    setCanLoadMore(filteredMessages.length > 0 && messages.length < 100);
  };

  useEffect(() => {
    if (id) {
      fetchResults(id, null);
    }
  }, [id]);

  const loadMore = () => {
    if (cursor && canLoadMore) {
      fetchResults(id, cursor);
    }
  };

  return (
    <div>
      <AoMessages messages={messages} />
      {canLoadMore && <button onClick={loadMore}>Load More</button>}
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
};

export default ProcessPage;
