import axios, {AxiosError} from "axios";
import {HF_TOKEN, SUMMANATION_MODEL} from "../index";
import {ChatInputCommandInteraction} from "discord.js";
import {createWarnEmbed} from "./embedGenerator";

export const summarize = async (content: string, interaction: ChatInputCommandInteraction) => {
    console.log("[Info] Initializing summarization model");
    try {
        const {data} = await axios.post<ReturnSummarizeContent[]>(SUMMANATION_MODEL, {
            inputs: content
        }, {
            headers: {
                Authorization: `Bearer ${HF_TOKEN}`,
            }
        });
        console.log("[Info] Summarized!");
        console.debug(data);

        return data[0];
    } catch (e: any) {
        if (e.isAxiosError) {
            if ((e as AxiosError).response?.status === 503) {
                if (!interaction.channel) {
                    throw new Error("No access to text channel");
                }
                // model was not loaded, so we'll display a warning message
                await interaction.channel.send({
                    embeds: [createWarnEmbed("Model is not loaded, this may take up to 10 minutes...")]
                })
                
                const {data} = await axios.post<ReturnSummarizeContent[]>(SUMMANATION_MODEL, {
                    inputs: content,
                    options: {
                        wait_for_model: true
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${HF_TOKEN}`,
                    }
                });
                console.log("[Info] Summarized!");
                console.debug(data);

                return data[0];
            } else {
                throw e;
            }
        } else {
            throw e;
        }
    }
}

export interface ReturnSummarizeContent {
    summary_text: string;
}