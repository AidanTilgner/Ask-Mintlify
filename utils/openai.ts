import {
  OpenAIApi,
  Configuration,
  CreateChatCompletionRequest,
  ResponseTypes,
} from "openai-edge";
import { OpenAIStream } from "ai";
import { RAGConfig } from "../declarations/main";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration: Configuration = {
  apiKey: OPENAI_API_KEY,
  isJsonMime(mime) {
    return mime === "application/json";
  },
};

const openai = new OpenAIApi(configuration);

export const getChatCompletion = async (
  messages: CreateChatCompletionRequest["messages"],
  model: CreateChatCompletionRequest["model"] = "gpt-3.5-turbo",
  stream: boolean = false
) => {
  try {
    const response = await openai.createChatCompletion({
      model,
      messages,
    });

    if (stream) {
      return OpenAIStream(response);
    }

    const data =
      (await response.json()) as ResponseTypes["createChatCompletion"];

    return data.choices[0].message?.content;
  } catch (error) {
    console.error(error);
    return "There was an error.";
  }
};

export const getChatCompletionWithRAG = async (
  messages: CreateChatCompletionRequest["messages"],
  model: CreateChatCompletionRequest["model"] = "davinci",
  stream: boolean = false,
  rag: RAGConfig
) => {};
