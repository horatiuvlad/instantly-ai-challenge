import fastifyCors from '@fastify/cors';
import { DB } from '../db/index.js';
const routes = async (fastify) => {
    // Enable CORS for local Next.js dev
    await fastify.register(fastifyCors, {
        origin: [/^http:\/\/localhost:\d+$/],
        credentials: true,
    });
    // Health
    fastify.get('/ping', async () => 'pong\n');
    // Emails CRUD
    fastify.get('/emails', async () => {
        return DB.listEmails();
    });
    fastify.get('/emails/:id', async (req, reply) => {
        const id = Number(req.params.id);
        const email = await DB.getEmail(id);
        if (!email)
            return reply.code(404).send({ error: 'Not found' });
        return email;
    });
    fastify.post('/emails', async (req, reply) => {
        const created = await DB.createEmail({
            to: req.body.to ?? null,
            cc: req.body.cc ?? null,
            bcc: req.body.bcc ?? null,
            subject: req.body.subject ?? null,
            body: req.body.body ?? null,
        });
        return reply.code(201).send(created);
    });
    fastify.put('/emails/:id', async (req, reply) => {
        const id = Number(req.params.id);
        const updated = await DB.updateEmail(id, req.body);
        if (!updated)
            return reply.code(404).send({ error: 'Not found' });
        return updated;
    });
    fastify.delete('/emails/:id', async (req, reply) => {
        const id = Number(req.params.id);
        const count = await DB.deleteEmail(id);
        if (!count)
            return reply.code(404).send({ error: 'Not found' });
        return { deleted: true };
    });
    // AI Drafting (router + specialized assistants)
    fastify.post('/ai/draft', async (req, reply) => {
        const { prompt } = req.body;
        if (!prompt || !prompt.trim()) {
            return reply.code(400).send({ error: 'prompt is required' });
        }
        const lower = prompt.toLowerCase();
        const type = /follow\s*-?\s*up|checking in|touching base|ping/i.test(lower) ? 'followup' : 'sales';
        const { subject, body } = generateEmail(type, prompt, req.body.context ?? {});
        return { type, subject, body };
    });
    // Streaming variant via SSE
    fastify.get('/ai/draft/stream', async (req, reply) => {
        const prompt = req.query.prompt;
        if (!prompt)
            return reply.code(400).send('prompt required');
        reply.header('Content-Type', 'text/event-stream');
        reply.header('Cache-Control', 'no-cache');
        reply.header('Connection', 'keep-alive');
        const lower = prompt.toLowerCase();
        const type = /follow\s*-?\s*up|checking in|touching base|ping/i.test(lower) ? 'followup' : 'sales';
        const { subject, body } = generateEmail(type, prompt, {});
        const send = (event, data) => {
            reply.raw.write(`event: ${event}\n`);
            reply.raw.write(`data: ${data}\n\n`);
        };
        send('type', JSON.stringify({ type }));
        subject.split(/(?<=[.!?])\s+/).forEach((chunk) => send('subject', chunk));
        body.split(/(?<=[.!?])\s+/).forEach((chunk) => send('body', chunk));
        send('done', 'true');
        reply.raw.end();
        return reply;
    });
};
function trimToWordLimit(text, maxWords) {
    const words = text.split(/\s+/).filter(Boolean);
    return words.slice(0, maxWords).join(' ');
}
function generateEmail(type, prompt, context) {
    if (type === 'followup') {
        const subject = trimToWordLimit(`Following up: ${prompt}`, 10);
        const body = trimToWordLimit(`Hi there, just checking in on ${prompt}. Do you have a minute this week? Happy to share details or adjust timing. Thanks!`, 40);
        return { subject, body };
    }
    const who = context.recipient ? `for ${context.recipient}` : '';
    const biz = context.business ? ` to help ${context.business}` : '';
    const subject = trimToWordLimit(`Quick idea ${who}: ${prompt}`, 10);
    const body = trimToWordLimit(`Hi ${context.recipient ?? 'there'}, noticed ${prompt}${biz}. 1) Fast setup 2) Clear results. Open to a 10‑min chat this week?`, 40);
    return { subject, body };
}
export default routes;
