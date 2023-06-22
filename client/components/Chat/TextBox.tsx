import React, { useEffect, useState } from "react";
import styles from "./TextBox.module.scss";
import { Checkbox } from "@mantine/core";
import { socket, api } from "../../utils/server";

function TextBox() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState({
    initialMessage: "",
    chatResponse: "",
  });
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [withRag, setWithRag] = useState(false);
  const [ragContext, setRagContext] = useState("");

  const inputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const submitMessage = async () => {
    setLoadingResponse(true);
    setResponse({
      initialMessage: message,
      chatResponse: "",
    });
    setMessage("");
    api
      .post("/chat", {
        message,
        with_rag: withRag,
        stream: true,
      })
      .then((res) => {
        setRagContext(res.data.data.rag_context);
      })
      .catch((err) => {
        setResponse({
          initialMessage: message,
          chatResponse: "Sorry, something went wrong.",
        });
        setLoadingResponse(false);
      });
  };

  const shouldOpenResponse = loadingResponse || response.chatResponse;

  useEffect(() => {
    socket.on("chat:datastream", (data) => {
      const done = data.done;
      setResponse((prev) => {
        return {
          initialMessage: prev.initialMessage,
          chatResponse: prev.chatResponse + data.message_fragment,
        };
      });
      if (done) {
        setLoadingResponse(false);
      }
    });

    return () => {
      socket.off("chat:datastream");
    };
  }, []);

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
          <p className={styles.ragContext}>
            {withRag && ragContext ? `Retrieved Context: ${ragContext}` : ""}
          </p>
          <p className={styles.initialMessage}>{response.initialMessage}</p>
          <p className={styles.responseText}>{response.chatResponse}</p>
        </div>
      )}
    </div>
  );
}

export default TextBox;
