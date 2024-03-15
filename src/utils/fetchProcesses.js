import { fetchProcessTransactionsQuery } from "./graphqlQueries";
import GlobalContext from "../utils/globalProcess";

export const fetchProcesses = async (address, setGlobalState) => {
  const query = fetchProcessTransactionsQuery(address);
  const response = await fetch("https://arweave.net/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  const processes = data.transactions.edges.map((edge) => edge.node);
  console.log(`processes: `, processes)
  setGlobalState((prevState) => ({
    ...prevState,
    processes: processes,
  }));
};
