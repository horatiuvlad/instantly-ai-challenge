import type { FastifyPluginAsync } from 'fastify';
import { DB, type Email } from '../db/index';

const routes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Health check
  fastify.get('/ping', async () => {
    return 'pong\n';
  });

  // Get all emails
  fastify.get('/emails', async (request, reply) => {
    try {
      const emails = await DB.getEmails();
      return emails;
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch emails' });
    }
  });

  // Get email by ID
  fastify.get<{ Params: { id: string } }>('/emails/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      const email = await DB.getEmailById(id);
      
      if (!email) {
        reply.status(404).send({ error: 'Email not found' });
        return;
      }
      
      return email;
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch email' });
    }
  });

  // Create new email
  fastify.post<{ Body: Omit<Email, 'id' | 'created_at' | 'updated_at'> }>('/emails', async (request, reply) => {
    try {
      const emailData = request.body;
      
      // Validate required fields
      if (!emailData.to || !emailData.subject || !emailData.body) {
        reply.status(400).send({ error: 'Missing required fields: to, subject, body' });
        return;
      }

      const [emailId] = await DB.createEmail(emailData);
      const createdEmail = await DB.getEmailById(emailId);
      
      reply.status(201).send(createdEmail);
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create email' });
    }
  });

  // Update email
  fastify.put<{ 
    Params: { id: string }, 
    Body: Partial<Omit<Email, 'id' | 'created_at' | 'updated_at'>> 
  }>('/emails/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      const updateData = request.body;
      
      const updated = await DB.updateEmail(id, updateData);
      
      if (updated === 0) {
        reply.status(404).send({ error: 'Email not found' });
        return;
      }
      
      const updatedEmail = await DB.getEmailById(id);
      return updatedEmail;
    } catch (error) {
      reply.status(500).send({ error: 'Failed to update email' });
    }
  });

  // Delete email
  fastify.delete<{ Params: { id: string } }>('/emails/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id);
      const deleted = await DB.deleteEmail(id);
      
      if (deleted === 0) {
        reply.status(404).send({ error: 'Email not found' });
        return;
      }
      
      reply.status(204).send();
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete email' });
    }
  });
};

export default routes;
