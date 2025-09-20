'use server';
/**
 * @fileOverview A Genkit flow for an AI to answer IQ questions.
 *
 * - answerQuestion - A function that provides an answer to a given IQ question.
 * - AnswerQuestionInput - The input type for the answerQuestion function.
 * - AnswerQuestionOutput - The return type for the answerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe('The IQ question.'),
  options: z.array(z.string()).describe('The possible answers.'),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answerIndex: z
    .number()
    .describe('The index of the selected answer from the options array.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(
  input: AnswerQuestionInput
): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const answerQuestionPrompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: AnswerQuestionInputSchema},
  output: {schema: AnswerQuestionOutputSchema},
  prompt: `You are an AI competing in a quiz. Analyze the following question and choose the correct answer from the options provided. Your response must be the index of the correct option.

Question: {{{question}}}
Options:
{{#each options}}
- {{@index}}: {{{this}}}
{{/each}}

Return the index of the most likely correct answer.`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async input => {
    const {output} = await answerQuestionPrompt(input);
    return output!;
  }
);
