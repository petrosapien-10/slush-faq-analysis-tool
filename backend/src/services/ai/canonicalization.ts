import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { LLM_CONFIG } from '../../config/constants.js';

const canonicalQuestionSchema = z.object({
  canonicalQuestion: z.string().describe('The canonical, grammatically correct version of the question'),
});

const canonicalFormSchema = z.object({
  canonicalQuestion: z.string().describe('Comprehensive canonical question representing all input questions'),
});

export async function canonicalizeQuestion(
  question: string
): Promise<string> {
  const llm = new ChatOpenAI({
    modelName: LLM_CONFIG.MODEL,
    temperature: LLM_CONFIG.TEMPERATURE,
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelKwargs: {
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'canonical_question',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              canonicalQuestion: {
                type: 'string',
                description: 'The canonical, grammatically correct version of the question',
              },
            },
            required: ['canonicalQuestion'],
            additionalProperties: false,
          },
        },
      },
    },
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are an expert at canonicalizing questions. Your ONLY job is to fix typos, grammar, and capitalization while preserving the exact meaning and intent.'],
    ['user', `Please canonicalize this question by fixing typos, grammar issues, and capitalization. Preserve the exact meaning and intent.

Question: {question}

Guidelines:
- Fix spelling errors and typos
- Correct grammar and punctuation
- Proper capitalization
- Professional but natural tone
- DO NOT change the meaning or intent
- DO NOT add or remove information
- DO NOT rephrase significantly

Respond with the canonical question in the required JSON format.`],
  ]);

  const chain = prompt.pipe(llm);
  const response = await chain.invoke({ question });

  const content = typeof response.content === 'string' 
    ? response.content 
    : JSON.stringify(response.content);
  
  const parsed = JSON.parse(content);
  const result = canonicalQuestionSchema.parse(parsed);
  
  return result.canonicalQuestion;
}

export async function generateCanonicalForm(
  questions: string[]
): Promise<string> {
  const llm = new ChatOpenAI({
    modelName: LLM_CONFIG.MODEL,
    temperature: LLM_CONFIG.TEMPERATURE,
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelKwargs: {
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'canonical_form',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              canonicalQuestion: {
                type: 'string',
                description: 'Comprehensive canonical question representing all input questions',
              },
            },
            required: ['canonicalQuestion'],
            additionalProperties: false,
          },
        },
      },
    },
  });

  const questionsText = questions
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n');

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are an expert at creating canonical questions from multiple similar questions. Your job is to rephrase and summarize while strictly preserving the original intent.'],
    ['user', `Please create a single canonical question that represents all of these questions:

Questions:
{questionsText}

CRITICAL CONSTRAINTS - Preserve Original Intent:
- PRESERVE the exact intent of ALL input questions - do NOT broaden or generalize
- REPHRASE for clarity and grammar only
- CLEAN typos and colloquialisms
- SUMMARIZE if questions are redundant
- DO NOT expand scope beyond what the questions actually ask
- DO NOT merge different intents into a broader category
- DO NOT add information not present in the input questions

Example (Correct - Preserves Intent):
Input: "how much do tix cost??", "whats the price for entrace", "cost for tickets?"
Output: "What is the ticket price?"

Example (WRONG - Broadens Scope):
Input: "how much do tix cost??", "whats the price for entrace"
Output: "What are the pricing and payment options?" TOO BROAD

If questions ask about DIFFERENT things, the canonical question should reflect the SPECIFIC shared aspect, not a general topic.

Respond with the canonical question in the required JSON format.`],
  ]);

  const chain = prompt.pipe(llm);
  const response = await chain.invoke({ questionsText });

  const content = typeof response.content === 'string' 
    ? response.content 
    : JSON.stringify(response.content);
  
  const parsed = JSON.parse(content);
  const result = canonicalFormSchema.parse(parsed);
  
  return result.canonicalQuestion;
}
