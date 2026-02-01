import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { FAQMatch } from '../clustering/vectorSearch.js';
import { LLM_CONFIG, CoverageStatus } from '../../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

const coverageSchema = z.object({
  status: z.enum([
    CoverageStatus.COVERED,
    CoverageStatus.PARTIALLY_COVERED,
    CoverageStatus.NOT_COVERED
  ]).describe(
    'Coverage status: covered (FAQs fully answer), partially_covered (FAQs answer some aspects), not_covered (FAQs do not address this)'
  ),
  explanation: z.string().describe('Brief natural-language reasoning for the decision'),
});

export type CoverageResult = z.infer<typeof coverageSchema>;

export async function determineCoverage(
  question: string,
  faqMatches: FAQMatch[]
): Promise<CoverageResult> {
  const llm = new ChatOpenAI({
    modelName: LLM_CONFIG.MODEL,
    temperature: LLM_CONFIG.TEMPERATURE,
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelKwargs: {
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'coverage_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: [CoverageStatus.COVERED, CoverageStatus.PARTIALLY_COVERED, CoverageStatus.NOT_COVERED],
                description: 'Coverage status: covered (FAQs fully answer), partially_covered (FAQs answer some aspects), not_covered (FAQs do not address this)',
              },
              explanation: {
                type: 'string',
                description: 'Brief natural-language reasoning for the decision',
              },
            },
            required: ['status', 'explanation'],
            additionalProperties: false,
          },
        },
      },
    },
  });

  const faqText = faqMatches
    .map((faq, i) => 
      `${i + 1}. [Similarity: ${faq.similarity.toFixed(2)}]\n   Q: ${faq.question}\n   A: ${faq.answer}`
    )
    .join('\n\n');

  // Create prompt template with proper variable interpolation
  const userMessage = `User Question: {question}

Top Matching FAQs:
{faqText}

Determine the coverage status using these criteria:

"covered": FAQs fully answer the question
- The FAQ directly addresses the user's core intent
- All key aspects of the question are answered
- User would have complete information to resolve their need
- No significant gaps or missing details

"partially_covered": FAQs answer SOME aspects but are incomplete
- FAQ addresses the topic but misses important details
- FAQ answers related but not exactly what was asked
- User would get partial information but need more
- Similarity is moderate (0.6-0.8) with content gaps

"not_covered": FAQs do not adequately address the question
- No FAQ directly addresses the user's intent
- Topic is different or only tangentially related
- Similarity scores are low (<0.6)
- User would not find useful information

Consider:
- Semantic similarity scores (provided)
- Completeness of the answer relative to the question
- Whether the user's core intent is addressed

Respond with JSON with fields: status (one of: covered, partially_covered, not_covered) and explanation (string)`;

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are analyzing whether a user question is covered by existing FAQs. Respond with JSON only.'],
    ['user', userMessage],
  ]);

  // Create chain and invoke
  const chain = prompt.pipe(llm);
  const response = await chain.invoke({
    question,
    faqText,
  });

  // Parse the response content
  const content = typeof response.content === 'string' 
    ? response.content 
    : JSON.stringify(response.content);
  
  const parsed = JSON.parse(content);
  const result = coverageSchema.parse(parsed);
  
  return result;
}
