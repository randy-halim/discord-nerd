import { HfInference, SummarizationOutput } from "@huggingface/inference";
import { HF_TOKEN, SUMMANATION_MODEL } from "..";
import { ReducedMessage, textifyMessageForTaskModels } from "./messages";

const endpoint = new HfInference(HF_TOKEN);

// export const $summarize = new Observable(async (subscriber) => {
//   return subscriber.complete();
// })

/**
 * summarizes a conversation using a Hugging Face task model, configured via
 * an enviroment variable. this was the tactic used when this bot was first created,
 * albiet in a more crude matter.
 * @param input a formatted (conversation) that should be fed to the task model
 * @returns a string containing the response from the task model
 */
export const summarize = async (input: string | ReducedMessage[]) => {
  if (typeof input !== "string") {
    input = input.map(textifyMessageForTaskModels).join("\n");
  }

  const settings = {
    inputs: input,
    model: SUMMANATION_MODEL,
    parameters: {
      max_length: 100,
    },
  };
  let response: SummarizationOutput;
  try {
    console.info(
      `[Info, ${new Date().toISOString()}] Attempting summarization on Interface Endpoints`
    );
    response = await endpoint.summarization(settings, {
      wait_for_model: false,
    });
  } catch (e: any) {
    // for now assume its just a 503 and try with wait_for_model
    console.info(
      `[Info, ${new Date().toISOString()}] Retrying summarization, waiting for Interface Endpoints`
    );
    response = await endpoint.summarization(settings, {
      wait_for_model: true,
    });
  }

  console.info(`[Info, ${new Date().toISOString()}] Done!`);
  return response.summary_text;
};
