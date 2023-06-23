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
        colors: {
          cool_green: [
            "#6CA18E",
            "#599C84",
            "#49967A",
            "#3A9171",
            "#2A8E6A",
            "#1B8C63",
            "#0C8C5E",
          ],
        },
        primaryColor: "cool_green",
        primaryShade: 6,
      }}
    >
      <div className={styles.App}>
        <div className={styles.main}>
          <div className={styles.resources}>
            <p>
              Check out the repo{" "}
              <a
                href="https://github.com/AidanTilgner/Ask-Mintlify"
                target="_blank"
              >
                here
              </a>
              .
            </p>
          </div>
          <AskMintlify />
        </div>
      </div>
    </MantineProvider>
  );
}

export default App;
