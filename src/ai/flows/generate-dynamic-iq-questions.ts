'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating dynamic IQ questions using an AI model.
 *
 * generateDynamicIQQuestions - A function that generates IQ questions based on the specified parameters.
 * GenerateDynamicIQQuestionsInput - The input type for the generateDynamicIQQuestions function.
 * GenerateDynamicIQQuestionsOutput - The output type for the generateDynamicIQQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDynamicIQQuestionsInputSchema = z.object({
  numberOfQuestions: z
    .number()
    .describe('The number of IQ questions to generate.'),
  topic: z.string().optional().describe('Optional topic for the IQ questions.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the IQ questions.'),
});
export type GenerateDynamicIQQuestionsInput = z.infer<
  typeof GenerateDynamicIQQuestionsInputSchema
>;

const GenerateDynamicIQQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of generated IQ questions.'),
});
export type GenerateDynamicIQQuestionsOutput = z.infer<
  typeof GenerateDynamicIQQuestionsOutputSchema
>;

export async function generateDynamicIQQuestions(
  input: GenerateDynamicIQQuestionsInput
): Promise<GenerateDynamicIQQuestionsOutput> {
  return generateDynamicIQQuestionsFlow(input);
}

const generateDynamicIQQuestionsPrompt = ai.definePrompt({
  name: 'generateDynamicIQQuestionsPrompt',
  input: {schema: GenerateDynamicIQQuestionsInputSchema},
  output: {schema: GenerateDynamicIQQuestionsOutputSchema},
  prompt: `You are an expert in creating IQ questions.

  Generate {{numberOfQuestions}} IQ questions with the following characteristics:

  - Difficulty: {{difficulty}}
  {{#if topic}}
  - Topic: {{topic}}
  {{/if}}

  Ensure that the questions are challenging and diverse, covering a range of cognitive skills.

  The questions should be returned in JSON format.
  `,
});

const generateDynamicIQQuestionsFlow = ai.defineFlow(
  {
    name: 'generateDynamicIQQuestionsFlow',
    inputSchema: GenerateDynamicIQQuestionsInputSchema,
    outputSchema: GenerateDynamicIQQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateDynamicIQQuestionsPrompt(input);
    return output!;
  }
);
