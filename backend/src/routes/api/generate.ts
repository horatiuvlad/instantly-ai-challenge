import type { FastifyPluginAsync } from 'fastify';
import { generateRequestSchema } from '../../types';
// @ts-expect-error: no types for zod-to-json-schema
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import OpenAI from 'openai';
import dotenv from 'dotenv';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateApi: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post('/api/generate', {
    schema: {
      body: zodToJsonSchema(generateRequestSchema),
    },
    handler: async (request, reply) => {
      const parse = generateRequestSchema.safeParse(request.body);
      if (!parse.success) {
        return reply.status(400).send('Invalid input');
      }
      const { prompt, count = 1 } = parse.data;
      // For demo: always use sales prompt
      const systemPrompt =
        'Sales: ≤40 words total, 7–10 words/sentence; first line = Subject (≤7 words), blank line, Body.';
      try {
        const stream = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-0125',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: true,
        });
        reply.raw.setHeader('Content-Type', 'text/plain; charset=utf-8');
        for await (const chunk of stream) {
          const token = chunk.choices?.[0]?.delta?.content;
          if (token) reply.raw.write(token);
        }
        reply.raw.end();
      } catch (e: any) {
        reply.status(500).send(e.message);
      }
    },
  });
};

export default generateApi;
