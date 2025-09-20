'use server';

import { generateDynamicIQQuestions, type GenerateDynamicIQQuestionsInput } from '@/ai/flows/generate-dynamic-iq-questions';
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
    
    const parsedQuestions = result.questions.map(q => {
        try {
            // The AI might return a JSON string, or a JS object literal string.
            // A simple eval is risky, but we can try a safe parse.
            const parsed = JSON.parse(q);
            if(parsed.question && Array.isArray(parsed.options) && typeof parsed.answerIndex === 'number') {
                return parsed as IQQuestion;
            }
            return null;
        } catch (e) {
            // It might not be a JSON string, but just the question text.
            // In a real scenario, we'd refine the AI prompt to be more reliable.
            // For now, we will treat this as a failure for this question.
            console.warn("Could not parse question string:", q);
            return null;
        }
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
