import type { FastifyPluginAsync } from 'fastify';
import { knex, mapEmailRow } from '../db';
import { createEmailInputSchema, updateEmailInputSchema, idParamSchema } from '../types';

const routes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Health
  fastify.get('/ping', async () => 'pong\n');

  // List emails, latest first
  fastify.get('/emails', async (_request, _reply) => {
    const rows = await knex('emails').orderBy('created_at', 'desc');
    return rows.map(mapEmailRow);
  });

  // Get one
  fastify.get('/emails/:id', async (request, reply) => {
    const parse = idParamSchema.safeParse(request.params);
    if (!parse.success) return reply.status(400).send({ error: 'Invalid id' });
    const row = await knex('emails').where({ id: parse.data.id }).first();
    if (!row) return reply.status(404).send({ error: 'Not found' });
    return mapEmailRow(row);
  });

  // Create email - NO SCHEMA, just Zod validation in handler
  fastify.post('/emails', {
    handler: async (request, reply) => {
      const parse = createEmailInputSchema.safeParse(request.body);
      if (!parse.success) {
        return reply.status(400).send({ error: 'Invalid input' });
      }
      const inserted = (await knex('emails').insert(parse.data)) as unknown;
      const newId: number = Array.isArray(inserted)
        ? (inserted[0] as number)
        : (inserted as number);
      const row = await knex('emails').where({ id: newId }).first();
      return mapEmailRow(row);
    },
  });

  // Update
  fastify.put('/emails/:id', async (request, reply) => {
    const idParse = idParamSchema.safeParse(request.params);
    if (!idParse.success) return reply.status(400).send({ error: 'Invalid id' });
    const bodyParse = updateEmailInputSchema.safeParse(request.body);
    if (!bodyParse.success) return reply.status(400).send({ error: 'Invalid input' });
    const updated = await knex('emails').where({ id: idParse.data.id }).update(bodyParse.data);
    if (!updated) return reply.status(404).send({ error: 'Not found' });
    const row = await knex('emails').where({ id: idParse.data.id }).first();
    return mapEmailRow(row);
  });

  // Delete
  fastify.delete('/emails/:id', async (request, reply) => {
    const parse = idParamSchema.safeParse(request.params);
    if (!parse.success) return reply.status(400).send({ error: 'Invalid id' });
    const deleted = await knex('emails').where({ id: parse.data.id }).del();
    if (!deleted) return reply.status(404).send({ error: 'Not found' });
    return { success: true };
  });
};
export default routes;
