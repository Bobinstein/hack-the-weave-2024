import { connectArweaveWallet } from "./arconnect";
import { fetchProcesses } from "./fetchProcesses";

export const connectArConnect = async (address, setAddress, setGlobalState) => {
  if (!address) {
    const arweaveAddress = await connectArweaveWallet();
    setAddress(arweaveAddress);
  } else {
    await fetchProcesses(address, setGlobalState);
  }
};
