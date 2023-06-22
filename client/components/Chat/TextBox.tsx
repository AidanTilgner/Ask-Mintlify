import React, { useEffect, useState } from "react";
import styles from "./TextBox.module.scss";
import { api } from "../../utils/axios";
import { Checkbox } from "@mantine/core";

function TextBox() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [withRag, setWithRag] = useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const submitMessage = async () => {
    setLoadingResponse(true);
    setMessage("");
    setResponse("");
    api
      .post("/chat", {
        message,
        with_rag: withRag,
      })
      .then((res) => {
        console.log("Data: ", res.data);
        setResponse(res.data.data.response);
        setLoadingResponse(false);
      })
      .catch((err) => {
        setResponse("Something went wrong, please try again later");
        setLoadingResponse(false);
      });
  };

  const shouldOpenResponse = loadingResponse || response;

  return (
    <div className={styles.askMintlifyBox}>
      <div className={styles.options}>
        <Checkbox
          label="With RAG"
          onChange={(e) => {
            setWithRag(e.currentTarget.checked);
          }}
          checked={withRag}
          color="white"
        />
      </div>
      <div className={styles.textboxContainer} onClick={() => setOpen(true)}>
        <input
          className={`${styles.textbox} ${
            shouldOpenResponse && styles.textBoxResponseOpen
          }`}
          ref={inputRef}
          type="text"
          placeholder="Ask Mintlify..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submitMessage();
            }
          }}
        />
        <div
          className={`${styles.logo} ${
            shouldOpenResponse && styles.responseOpen
          } ${loadingResponse && styles.loadingResponse}`}
        >
          <img src="/assets/mintlify-logo.svg" alt="mintlify-logo" />
        </div>
      </div>
      {shouldOpenResponse && (
        <div className={styles.response}>
          <p className={styles.responseText}>{response}</p>
          {!response && <div className={styles.spacer} />}
        </div>
      )}
    </div>
  );
}

export default TextBox;
