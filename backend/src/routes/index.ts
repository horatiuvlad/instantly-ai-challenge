import type { FastifyPluginAsync } from 'fastify';
import { knex, mapEmailRow } from '../db';
import { createEmailInputSchema, emailSchema } from '../types';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const routes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Health
  fastify.get('/ping', async () => 'pong\n');

  // List emails, latest first
  fastify.get('/emails', async (request, reply) => {
    const rows = await knex('emails').orderBy('created_at', 'desc');
    return rows.map(mapEmailRow);
  });

  // Create email
  fastify.post('/emails', {
    schema: {
      body: zodToJsonSchema(createEmailInputSchema),
      response: { 200: zodToJsonSchema(emailSchema) },
    },
    handler: async (request, reply) => {
      const parse = createEmailInputSchema.safeParse(request.body);
      if (!parse.success) {
        return reply.status(400).send({ error: 'Invalid input' });
      }
      const [id] = await knex('emails').insert(parse.data).returning('id');
      const row = await knex('emails').where({ id: typeof id === 'object' ? id.id : id }).first();
      return mapEmailRow(row);
    },
  });
};

export default routes;
