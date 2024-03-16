import React, { useState, useContext, useEffect } from "react";
import GlobalContext from "../utils/globalProcess";
import { checkAddress } from "../utils/checkAddress";
import { fetchProcesses } from "../utils/fetchProcesses";
import { fetchResults } from "../utils/fetchResults";
import { connectArConnect } from "../utils/connectArConnect";
import { handleLuaClick } from "../utils/handleLuaClick";
import AoMessages from "../components/aoMessages";
import luaArray from '../lua/exports';
import Head from "next/head";
import ProcessComponent from "../components/ProcessComponent";
import NavBar from '../components/NavBar';

export default function Home() {
  const { globalState, setGlobalState } = useContext(GlobalContext);
  const [address, setAddress] = useState(null);
  const [currentHash, setCurrentHash] = useState("");
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkAddress(setAddress);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('process/')) {
      const processId = hash.split('/')[1];
      fetchResults(processId, null, setMessages, setCursor, setCanLoadMore, messages);
    }
  }, [currentHash]);


  
  useEffect(() => {
    if (address) {
      fetchProcesses(address, setGlobalState);
    }
  }, [address]);

  useEffect(() => {
    // Immediately replace the URL with the pathname only, removing the hash
    window.history.replaceState(null, '', window.location.pathname);

    const handleHashChange = () => {
        setCurrentHash(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
}, []);

  

  async function loadMore(){
    const processId = currentHash.split('/')[1];
      fetchResults(processId, cursor, setMessages, setCursor, setCanLoadMore, messages);
  }

  async function refreshResults(){
    const processId = currentHash.split('/')[1];
      fetchResults(processId, null, setMessages, setCursor, setCanLoadMore, messages);
  }

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
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h1>COOL SPINNER GOES HERE</h1>
          </div>
        ) : (
          <>
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
                    <div key={index} onClick={() => handleLuaClick(script, currentHash, setIsLoading)} style={{ cursor: 'pointer', margin: '10px', padding: '10px', border: '1px solid #ddd' }}>
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
          </>
        )}
      </main>
    </>
  );
  
}
