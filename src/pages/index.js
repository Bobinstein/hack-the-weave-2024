// src/pages/index.js
import React, { useState, useContext, useEffect } from "react";
import GlobalContext from "../utils/globalProcess";
import { connectArweaveWallet, checkActiveAddress } from "../utils/arconnect";
import { fetchProcessTransactionsQuery } from "../utils/graphqlQueries";
import AoMessages from "../components/aoMessages";
import loadLua from "../utils/loadLua";
import luaArray from '../lua/exports';
import Head from "next/head";
import ProcessComponent from "../components/ProcessComponent";
import {message, results} from "@permaweb/aoconnect"
import NavBar from '../components/NavBar';


export default function Home() {
  const { globalState, setGlobalState } = useContext(GlobalContext);
  const [address, setAddress] = useState(null);
  const [currentHash, setCurrentHash] = useState("");
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [canLoadMore, setCanLoadMore] = useState(true);
  

  // Process-related logic here, similar to what was in ProcessPage

  useEffect(() => {
    async function checkAddress() {
      const activeAddress = await checkActiveAddress();
      if (activeAddress) {
        setAddress(activeAddress);
      }
    }

    checkAddress();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('process/')) {
      const processId = hash.split('/')[1];
      fetchResults(processId, null);
    }
  }, [currentHash]);

  useEffect(() => {
    async function fetchData() {
      if (address) {
        const query = fetchProcessTransactionsQuery(address);
        const response = await fetch("https://arweave.net/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const { data } = await response.json();
        const processes = data.transactions.edges.map((edge) => edge.node);

        setGlobalState((prevState) => ({
          ...prevState,
          processes: processes,
        }));

        console.log(processes);
      }
    }

    fetchData().catch(console.error);
  }, [address, setGlobalState])

  useEffect(() => {
    setCurrentHash(window.location.hash);
    
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [address]);

  // Rest of the useEffects and functions as in the previous index.js and [id].js

  async function connectArConnect() {
    if(!address)
 {   const arweaveAddress = await connectArweaveWallet();
    setAddress(arweaveAddress);}
    else if (address){
      fetchData()
    }
  }

  const loadMore = () => {
    if (cursor && canLoadMore) {
      fetchResults(id, cursor);
    }
  };

  const refreshResults = () => {
    const processId = currentHash.replace('#process/', '');
    if (processId) {
      fetchResults(processId, null);
    }
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
      .filter((node) => node.Messages && node.Messages.length > 0 && node.Messages[0].Data);

    setMessages((prev) => [...prev, ...filteredMessages]);
    const newCursor =
      resultsOut.edges?.[resultsOut.edges.length - 1]?.cursor ?? null;
    setCursor(newCursor);

    setCanLoadMore(filteredMessages.length > 0 && messages.length < 100);
  };

  const handleLuaClick = async (luaScript) => {
    const processId = currentHash.replace('#process/', '');
    if (processId) {
      await loadLua(processId, luaScript.lua);
    }
  };

  return (
    <>
      <Head>
        <title>Bobs Hackathon Thingy</title>
        <meta name="description" content="A simple permaweb dApp for ao stuff" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <NavBar />
        {currentHash === "" && (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {address && (!globalState.processes || globalState.processes.length === 0) && <p>Loading processes</p>}
            {globalState.processes?.map((process) => (
              <ProcessComponent key={process.id} process={process} />
            ))}
          </div>
        )}
        {currentHash.startsWith('#process/') && (
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              {messages.length > 0 ? <AoMessages messages={messages} /> : <p>You have no messages.</p>}
              {canLoadMore && <button onClick={loadMore}>Load More</button>}
              <button onClick={refreshResults}>Refresh</button>
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
        )}
        {!address && (
          <button onClick={connectArConnect}>Connect Arweave Wallet</button>
        )}
        {address && <p>Connected with: {address}</p>}
      </main>
    </>
  );
}
