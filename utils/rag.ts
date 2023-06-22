import { getChatCompletion } from "./openai";
import { getPrediction } from "./nlp";
import axios from "axios";
import config from "../data/config.json";
import { CreateChatCompletionRequest } from "openai-edge";

const getSystemPrompts = () => {
  const configPrompt = config.model.system.prompt;

  const prompt = `
  ${configPrompt}

  Also, keep in mind that you may be given context to help you formulate your response.
  This context will be injected into the user's message automatically.
  The context is simply additional information that may be useful.
  `;
};

export const getResponse = async (text: string, withRag: boolean) => {
  try {
    if (withRag) {
      const prediction = await getPrediction(text);
      const baseURL = config.rag.baseUrl;

      if (!prediction.intentData?.config) {
        const systemPrompt = config.model.system.prompt;
        const userPrompt = text;

        const messages: CreateChatCompletionRequest["messages"] = [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ];

        const completion = await getChatCompletion(messages);

        return completion;
      }
      const response = await axios.post(
        `${baseURL}/${prediction.intentData.config.endpoint}`,
        {
          ...prediction.intentData.config.body,
          originalText: text,
        }
      );

      const { context: ragContext } = response.data;

      const systemPrompt = config.model.system.prompt;
      const userPrompt = `
      ${text}

      | SYSTEM INJECTED CONTEXT |
      "${ragContext}"
      
      This context has been automatically added to help you formulate your response.
      | END SYSTEM INJECTED CONTEXT |
    `;

      const messages: CreateChatCompletionRequest["messages"] = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ];

      const completion = await getChatCompletion(messages);

      return completion;
    } else {
      const systemPrompt = config.model.system.prompt;
      const userPrompt = `
    ${text}
    `;

      const messages: CreateChatCompletionRequest["messages"] = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ];

      const completion = await getChatCompletion(messages);

      return completion;
    }
  } catch (error) {
    console.error("Error:", error);
    return "There was an error.";
  }
};
