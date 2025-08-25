import type { FastifyPluginAsync } from 'fastify';
import { routeRequestSchema, routeResponseSchema } from '../../types';
// @ts-expect-error: no types for zod-to-json-schema
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const routeApi: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post('/api/route', {
    schema: {
      body: zodToJsonSchema(routeRequestSchema),
      response: {
        200: zodToJsonSchema(routeResponseSchema),
      },
    },
    handler: async (request, reply) => {
      const parse = routeRequestSchema.safeParse(request.body);
      if (!parse.success) {
        return reply.status(400).send({ success: false, error: 'Invalid input' });
      }
      const { email } = parse.data;
      const systemPrompt =
        'Classify as sales or followup; return JSON {type, subjectHint} only.';
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-0125',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(email) },
          ],
          response_format: { type: 'json_object' },
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('No content');
        const parsed = JSON.parse(content);
        return { success: true, ...parsed };
      } catch (e: any) {
        return reply.status(500).send({ success: false, error: e.message });
      }
    },
  });
};

export default routeApi;
