import "@/styles/globals.css";


import { GlobalProvider } from '../utils/globalProcess';

function MyApp({ Component, pageProps }) {
  return (
    <GlobalProvider>
      <Component {...pageProps} />
    </GlobalProvider>
  );
}

export default MyApp;
