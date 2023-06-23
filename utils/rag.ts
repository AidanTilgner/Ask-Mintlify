import { getChatCompletion } from "./openai";
import { getPrediction } from "./nlp";
import axios from "axios";
import config from "../data/config.json";
import { CreateChatCompletionRequest } from "openai-edge";
import dotenv from "dotenv";

dotenv.config();

const ISDEV = process.env.NODE_ENV === "development";

const getSystemPrompt = () => {
  const configPrompt = config.model.system.prompt;

  const prompt = `
  ${configPrompt}

  Also, keep in mind that you may be given context by the system to help formulate your response.
  If you recieve context, know that it is not specified by the user, but rather by the system, and you should consider it truthful.
  Don't mention the system injected context directly, but rather use it to help formulate your response.
  `;

  return prompt;
};

export const getPrompts = async (text: string, withRag: boolean) => {
  try {
    const context = {
      ragContext: "",
    };
    if (withRag) {
      const prediction = await getPrediction(text);
      if (prediction && prediction.intentData?.config?.endpoint) {
        const baseURL = ISDEV ? config.rag.devBaseUrl : config.rag.baseUrl;

        const response = await axios.post(
          `${baseURL}/${prediction.intentData.config.endpoint}`,
          {
            ...prediction.intentData.config.body,
            originalText: text,
          }
        );

        const { context: ragContext } = response.data;

        context.ragContext = ragContext;
      }
    }

    const systemPrompt = getSystemPrompt();
    const userPrompt = `
      ${text}

      ${
        context.ragContext
          ? `
      | SYSTEM INJECTED CONTEXT |
      "${context.ragContext}"
      | END SYSTEM INJECTED CONTEXT |
            `
          : ""
      }
      
    `;

    return {
      systemPrompt,
      userPrompt,
      success: true,
      ragContext: context.ragContext,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      systemPrompt: "",
      userPrompt: "",
      success: false,
      ragContext: "",
    };
  }
};

export const getResponse = async (text: string, withRag: boolean) => {
  try {
    const prompts = await getPrompts(text, withRag);

    if (!prompts.success) {
      return {
        completion: null,
        success: false,
        ragContext: "",
      };
    }

    const { systemPrompt, userPrompt, ragContext } = prompts;

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

    return {
      completion: completion,
      success: true,
      ragContext: ragContext,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      completion: null,
      success: false,
      ragContext: "",
    };
  }
};

export const getResponseStream = async (text: string, withRag: boolean) => {
  try {
    const prompts = await getPrompts(text, withRag);

    if (!prompts.success) {
      return {
        completion: null,
        success: false,
        ragContext: "",
      };
    }

    const { systemPrompt, userPrompt, ragContext } = prompts;

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

    const completion = (await getChatCompletion(
      messages,
      "gpt-3.5-turbo",
      true
    )) as ReadableStream;

    return {
      completion: completion,
      success: true,
      ragContext: ragContext,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      completion: null,
      success: false,
      ragContext: "",
    };
  }
};
