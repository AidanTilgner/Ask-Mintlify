import React from "react";
import "./Global.scss";
import styles from "./App.module.scss";
import AskMintlify from "./Pages/AskMintlify";

function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className={styles.App}>
      <div className={styles.main}>
        <AskMintlify />
      </div>
    </div>
  );
}

export default App;
