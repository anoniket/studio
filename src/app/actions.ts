'use server';

import {
  generateDynamicIQQuestions,
  type GenerateDynamicIQQuestionsInput,
} from '@/ai/flows/generate-dynamic-iq-questions';
import {
  answerQuestion as answerQuestionFlow,
  type AnswerQuestionInput,
} from '@/ai/flows/answer-question-flow';
import type { IQQuestion } from '@/lib/types';

const DUMMY_QUESTIONS: IQQuestion[] = [
    {
        question: "Which number should come next in the pattern? 1, 1, 2, 3, 5, ...",
        options: ["8", "13", "21", "26"],
        answerIndex: 0,
        explanation: "This is the Fibonacci sequence, where each number is the sum of the two preceding ones."
    },
    {
        question: "What is the missing number in the sequence: 4, 9, 16, __, 36, 49?",
        options: ["24", "25", "28", "30"],
        answerIndex: 1,
        explanation: "The sequence consists of perfect squares: 2^2, 3^2, 4^2, 5^2, 6^2, 7^2."
    },
    {
        question: "A is the father of B. But B is not the son of A. How is that possible?",
        options: ["B is A's nephew", "B is adopted", "B is A's daughter", "It's not possible"],
        answerIndex: 2,
        explanation: "The riddle plays on gender assumptions. B is A's daughter."
    },
];

export async function getQuizQuestions(
  input: GenerateDynamicIQQuestionsInput
): Promise<IQQuestion[]> {
  try {
    const result = await generateDynamicIQQuestions(input);
    
    if (!result || !result.questions || result.questions.length === 0) {
        throw new Error("AI returned no questions.");
    }
    
    // The AI might return an array of strings where each string is a JSON object, or an array of objects directly
    const questionsList = (typeof result.questions[0] === 'string')
      ? result.questions.map(q => JSON.parse(q as string))
      : result.questions;

    const parsedQuestions = questionsList.map((q: any) => {
        if(q.question && Array.isArray(q.options) && typeof q.answerIndex === 'number') {
            return q as IQQuestion;
        }
        return null;
    }).filter((q): q is IQQuestion => q !== null);


    if (parsedQuestions.length < input.numberOfQuestions) {
        console.warn(`AI returned only ${parsedQuestions.length} valid questions. Filling with dummies.`);
        const dummyNeeded = input.numberOfQuestions - parsedQuestions.length;
        return [...parsedQuestions, ...DUMMY_QUESTIONS.slice(0, dummyNeeded)];
    }

    return parsedQuestions;

  } catch (error) {
    console.error('Failed to get quiz questions from AI:', error);
    console.log(`Falling back to ${input.numberOfQuestions} dummy questions.`);
    return DUMMY_QUESTIONS.slice(0, input.numberOfQuestions);
  }
}

export async function getAIAnswer(input: AnswerQuestionInput): Promise<number> {
    try {
        const result = await answerQuestionFlow(input);
        return result.answerIndex;
    } catch (error) {
        console.error('AI failed to answer question:', error);
        // Fallback to random answer
        return Math.floor(Math.random() * input.options.length);
    }
}
