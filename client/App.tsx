import React from "react";
import "./Global.scss";
import styles from "./App.module.scss";
import AskMintlify from "./Pages/AskMintlify";
import { MantineProvider } from "@mantine/core";

function App() {
  const [count, setCount] = React.useState(0);

  return (
    <MantineProvider
      theme={{
        colorScheme: "dark",
      }}
    >
      <div className={styles.App}>
        <div className={styles.main}>
          <AskMintlify />
        </div>
      </div>
    </MantineProvider>
  );
}

export default App;
