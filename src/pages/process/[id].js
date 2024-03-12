// src/pages/process/[id].js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AoMessages from "../../components/aoMessages";
import loadLua from "../../utils/loadLua";
import luaArray from '../../lua/exports';
import { results } from "@permaweb/aoconnect";

const ProcessPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [canLoadMore, setCanLoadMore] = useState(true);

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

  const handleLuaClick = async (luaScript) => {
    await loadLua(id, luaScript.lua);
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <AoMessages messages={messages} />
        {canLoadMore && <button onClick={loadMore}>Load More</button>}
      </div>
      <div style={{ flex: 1, padding: '10px' }}>
        {luaArray.map((script, index) => (
          <div key={index} onClick={() => handleLuaClick(script)} style={{ cursor: 'pointer', margin: '10px', padding: '10px', border: '1px solid #ddd' }}>
            <strong>{script.name}</strong>
            <p>{script.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessPage;
