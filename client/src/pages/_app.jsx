import { StateProvider } from "@/context/StateContext";
import "@/styles/globals.css";
import Head from "next/head";
import reducer,{initialState} from "@/context/StateReducers";


export default function App({ Component, pageProps }) {
  return (
    <StateProvider initialState={initialState} reducer={reducer} >
      <Head>
        <title>Conn</title>
        <link rel="shortcut icon" href="/connFavicon.png" />
      </Head>
      <Component {...pageProps} />
    </StateProvider>
  )
}
