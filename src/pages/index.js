import React, { useState, useContext, useEffect } from "react";
import GlobalContext from "../utils/globalProcess";
import { checkAddress } from "../utils/checkAddress";
import { fetchProcesses } from "../utils/fetchProcesses";
import { fetchResults } from "../utils/fetchResults";
import { connectArConnect } from "../utils/connectArConnect";
import { handleLuaClick } from "../utils/handleLuaClick";
import { fetchGameState } from "@/utils/fetchGameState";
import RenderGameGrid from "../utils/renderGameGrid";
import RenderAnnouncements from "../utils/renderAnnouncements";
import AoMessages from "../components/aoMessages";
import luaArray from "../lua/exports";
import Head from "next/head";
import ProcessComponent from "../components/ProcessComponent";
import NavBar from "../components/NavBar";
import { checkActiveAddress } from "@/utils/arconnect";
import { fetchProcessTransactionsQuery } from "@/utils/graphqlQueries";

export default function Home() {
  const { globalState, setGlobalState } = useContext(GlobalContext);
  // State for both home and game views
  const [address, setAddress] = useState(null);
  const [currentHash, setCurrentHash] = useState("");
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      if (currentHash.startsWith("#game")) {
        await fetchGameState(
          setGameState,
          setAnnouncements,
          setTimeRemaining,
          gameState,
          announcements
        );
      }
    };

    const interval = setInterval(fetchGame, 5000);

    return () => clearInterval(interval); // This will clear the interval when the component unmounts or the useEffect is re-run
  }, [currentHash]); // Include currentHash if it's important to restart the interval when it changes

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
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("process/")) {
      const processId = hash.split("/")[1];
      fetchResults(
        processId,
        null,
        setMessages,
        setCursor,
        setCanLoadMore,
        messages
      );
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
  }, [address, setGlobalState]);

  useEffect(() => {
    setCurrentHash(window.location.hash);

    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [address]);

  useEffect(() => {
    checkAddress(setAddress);
    // Fetch processes for home view
    if (address) {
      fetchProcesses(address, setGlobalState);
    }
    // Initialize game view if hash indicates
    if (currentHash.startsWith("#game")) {
      fetchProcesses(address, setGlobalState);
      fetchGameState(
        setGameState,
        setAnnouncements,
        setTimeRemaining,
        gameState,
        announcements
      );
    }
  }, [address, currentHash]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Function to load more messages or game data
  async function loadMore() {
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("process/")) {
      const processId = hash.split("/")[1];
      fetchResults(
        processId,
        cursor,
        setMessages,
        setCursor,
        setCanLoadMore,
        messages
      );
    }
  }

  const handleConnect = () => {
    connectArConnect(address, setAddress, setGlobalState);
  };

  async function refreshResults() {
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("process/")) {
      const processId = hash.split("/")[1];
      fetchResults(
        processId,
        null,
        setMessages,
        setCursor,
        setCanLoadMore,
        messages
      );
    }
  }

  const isPlayerOwned = (playerId) => {
    return globalState.processes?.some((process) => process.id === playerId);
  };

  return (
    <>
      <Head>
        <title>Bobs Hackathon Thingy</title>
        <meta
          name="description"
          content="A simple permaweb dApp for ao stuff"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <NavBar />
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <h1>COOL SPINNER GOES HERE</h1>
          </div>
        ) : (
          <>
            {currentHash === "" && (
              <>
                {globalState.processes && globalState.processes.length > 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: "20px",
                      marginTop: "20px",
                    }}
                  >
                    Click on one of your processes to view messages or load lua
                    scripts.
                  </div>
                )}
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {address &&
                    (!globalState.processes ||
                      globalState.processes.length === 0) && (
                      <p>Loading processes...</p>
                    )}
                  {globalState.processes?.map((process) => (
                    <ProcessComponent key={process.id} process={process}/>
                  ))}
                </div>
              </>
            )}

            {currentHash.startsWith("#process/") && (
              <>
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                    marginBottom: "20px",
                  }}
                >
                  Click on a lua script to load it into this process
                </div>
                <div style={{ display: "flex" }}>
                  <div style={{ flex: 1 }}>
                    {messages.length > 0 ? (
                      <AoMessages messages={messages} />
                    ) : (
                      <p>You have no messages.</p>
                    )}
                    {canLoadMore && (
                      <button onClick={loadMore}>Load More</button>
                    )}
                    <button onClick={refreshResults}>Refresh</button>
                  </div>
                  <div style={{ flex: 1, padding: "10px" }}>
                    {luaArray.map((script, index) => (
                      <div
                        key={index}
                        onClick={() =>
                          handleLuaClick(script, currentHash, setIsLoading)
                        }
                        style={{
                          cursor: "pointer",
                          margin: "10px",
                          padding: "10px",
                          border: "1px solid #ddd",
                        }}
                      >
                        <strong>{script.name}</strong>
                        <p>{script.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentHash.startsWith("#game") && (
              <div>
                <h1>Game State</h1>
                {timeRemaining && <p>Time Remaining: {timeRemaining}</p>}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "start",
                  }}
                >
                  <div style={{ flex: 3, marginRight: "5%" }}>
                    <RenderGameGrid
                      gameState={gameState}
                      isPlayerOwned={isPlayerOwned}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <RenderAnnouncements announcements={announcements} />
                  </div>
                </div>
              </div>
            )}
            {!address ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                }}
              >
                <button
                  onClick={handleConnect}
                  style={{ padding: "10px 20px", fontSize: "1.5em" }}
                >
                  Connect Arweave Wallet
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <p>Connected with: {address}</p>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
