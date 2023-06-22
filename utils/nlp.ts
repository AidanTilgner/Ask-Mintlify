import { containerBootstrap, Nlp } from "@nlpjs/basic";

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
