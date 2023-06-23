import React, { useEffect, useState } from "react";
import styles from "./TextBox.module.scss";
import { Checkbox } from "@mantine/core";
import { socket, api } from "../../utils/server";
import { ArrowsClockwise, X } from "@phosphor-icons/react";

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

  const formatRagContext = (ragContext: string) => {
    const regex = /https?:\/\/[^\s()]+/g; // Exclude parentheses from links
    const matches = ragContext.match(regex);
    if (matches) {
      matches.forEach((match) => {
        ragContext = ragContext.replace(
          match,
          `<a href="${match}" target="_blank">${match}</a>`
        );
      });
    }
    ragContext = ragContext.trim().replace(/\n/g, "<br />");
    return `Retrieved Context:<br /><br /> ${ragContext}`;
  };

  const formatLLMResponse = (response: string) => {
    const regex = /https?:\/\/[^\s()]+/g; // Exclude parentheses from links
    const matches = response.match(regex);
    if (matches) {
      matches.forEach((match) => {
        response = response.replace(
          match,
          `<a href="${match}" target="_blank">${match}</a>`
        );
      });
    }
    response = response.trim().replace(/\n/g, "<br />");
    return response;
  };

  const inputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const submitMessage = async (providedMessage?: string) => {
    const useMessage = providedMessage || message;
    if (!useMessage) {
      alert("Please enter a message");
      return;
    }
    setLoadingResponse(true);
    setResponse({
      initialMessage: useMessage,
      chatResponse: "",
    });
    setMessage("");
    setRagContext("");
    api
      .post("/chat", {
        message: useMessage,
        with_rag: withRag,
        stream: true,
      })
      .then((res) => {
        setRagContext(res.data.data.rag_context);
      })
      .catch((err) => {
        setResponse({
          initialMessage: useMessage,
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

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
      if (e.ctrlKey && e.key === "Enter") {
        if (!message) {
          return;
        }
        submitMessage();
      }
      if (e.ctrlKey && e.key === "p") {
        inputRef.current?.focus();
      }
      if (e.ctrlKey && e.key === "a") {
        setWithRag((prev) => !prev);
      }
    });

    return () => {
      socket.off("chat:datastream");
      window.removeEventListener("keydown", () => {});
    };
  }, []);

  return (
    <div className={styles.askMintlifyBox}>
      <div className={styles.options}>
        <Checkbox
          label="With Retrieval Augmented Generation"
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
        <div
          className={`${styles.response} ${
            loadingResponse && styles.isLoadingResponse
          }`}
        >
          <div className={styles.responseOptions}>
            <button
              className={styles.clear}
              title="Retry"
              onClick={() => {
                submitMessage(response.initialMessage);
              }}
            >
              <ArrowsClockwise />
            </button>
            <button
              className={styles.clear}
              title="Clear"
              onClick={() => {
                setResponse({
                  initialMessage: "",
                  chatResponse: "",
                });
                setRagContext("");
                setLoadingResponse(false);
              }}
            >
              <X />
            </button>
          </div>
          {withRag && ragContext && (
            <p
              className={styles.ragContext}
              dangerouslySetInnerHTML={{
                __html: formatRagContext(ragContext),
              }}
            />
          )}
          <p className={styles.initialMessage}>{response.initialMessage}</p>
          <p
            className={styles.responseText}
            dangerouslySetInnerHTML={{
              __html: formatLLMResponse(response.chatResponse),
            }}
          />
        </div>
      )}
    </div>
  );
}

export default TextBox;
