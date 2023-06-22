import { containerBootstrap, Nlp } from "@nlpjs/basic";
import { readFileSync } from "fs";

const corpus_file = "data/corpus.json";

const model: {
  nlp: any;
} = {
  nlp: null,
};

export const train = async () => {
  try {
    const container = containerBootstrap();
    container.use(Nlp);
    const nlp = container.get("nlp");
    nlp.settings.autoSave = false;
    nlp.settings.autoLoad = false;
    nlp.settings.log = false;

    await nlp.addCorpus(corpus_file);
    await nlp.train();
    const modelName = "model.nlp";
    await nlp.save("data/models/" + modelName);
    model.nlp = nlp;
    return modelName;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getNLP = async () => {
  if (!model.nlp) {
    train();
    return model.nlp;
  }
  return model.nlp;
};

const getIntentData = async (intent: string) => {
  const corpus = readFileSync(corpus_file, "utf-8");
  const data = JSON.parse(corpus).data;
  const intentData = data.find((d: any) => d.intent === intent);
  return intentData as {
    intent: string;
    utterances: string[];
    answers: string[];
    config: {
      endpoint: string;
      body: any;
    };
  };
};

export const getPrediction = async (text: string) => {
  const nlp = await getNLP();
  const result = await nlp.process("en", text.toLowerCase());
  return {
    intent: result.intent as string,
    score: result.score as string,
    classifications: result.classifications as {
      intent: string;
      score: number;
    }[],
    intentData: await getIntentData(result.intent),
  };
};
