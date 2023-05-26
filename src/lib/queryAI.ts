import axios, {AxiosError, AxiosResponse} from "axios";
import {HF_TOKEN, SUMMANATION_MODEL} from "../index";
import {ChatInputCommandInteraction} from "discord.js";
import {createErrorEmbed, createWarnEmbed} from "./embedGenerator";

async function summarize(content: string, interaction: ChatInputCommandInteraction, waitForModel = false): Promise<ReturnSummarizeContent> {
    const headers = {
        Authorization: `Bearer ${HF_TOKEN}`
    };
    try {
        console.log("[Info] Sending request to summarization model...");
        let res: AxiosResponse<ReturnSummarizeContent[]>;
        if (waitForModel) {
            console.warn("[Info] Waiting for model to be loaded.");
            await interaction.editReply({
                embeds: [createWarnEmbed("Model is not loaded. Processing may take longer.")]
            });

            res = await axios.post(
                SUMMANATION_MODEL,
                {
                    inputs: content,
                    options: {
                        wait_for_model: true
                    }
                },
                { headers }
            );
        } else {
            res = await axios.post(
                SUMMANATION_MODEL,
                {
                    inputs: content
                }
            );
        }

        console.log("[Info] Summarization successful!");
        console.debug(res.data);

        const returnData = res.data[0];
        returnData.success = true;

        return returnData;
    } catch (e: any) {
        // type guard for AxiosError
        if (e.isAxiosError) {
            const err: AxiosError = e;

            if (err.response?.status === 503) {
                return await summarize(content, interaction, true);
            } else if (err.response?.status === 504) {
                await interaction.editReply({
                    embeds: [createErrorEmbed("The model timed out while processing the request.")]
                });
                return {
                    success: false,
                    summary_text: ""
                }
            } else {
                throw e;
            }
        } else {
            // log to console, return error message
            console.error(e);
            await interaction.editReply({
                embeds: [createErrorEmbed()]
            });
            return {
                success: false,
                summary_text: ""
            };
        }
    }
}

export {summarize};

export interface ReturnSummarizeContent {
    summary_text: string;
    success: boolean;
}