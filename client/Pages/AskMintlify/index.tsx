import React from "react";
import TextBox from "../../components/Chat/TextBox";
import styles from "./index.module.scss";

function AskMintlify() {
  return (
    <div className={styles.askMintlify}>
      <div className={styles.textboxContainer}>
        <TextBox />
      </div>
    </div>
  );
}

export default AskMintlify;
