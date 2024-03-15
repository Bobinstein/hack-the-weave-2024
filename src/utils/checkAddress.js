import { checkActiveAddress } from "./arconnect";

export const checkAddress = async (setAddress) => {
  const activeAddress = await checkActiveAddress();
  if (activeAddress) {
    setAddress(activeAddress);
  }
};
