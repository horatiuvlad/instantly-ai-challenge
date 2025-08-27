import type { FastifyPluginAsync } from 'fastify';
import { DB, type Email } from '../db/index.js';
import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const routes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Health check
  fastify.get('/ping', async () => {
    return 'pong\n';
  });

  // AI Email Generation
  fastify.post<{ Body: { prompt: string } }>(
    '/ai/generate-email',
    async (request, reply) => {
      try {
        const { prompt } = request.body;

        if (!prompt) {
          reply.status(400).send({ error: 'Prompt is required' });
          return;
        }

        // Router assistant to classify the request
        const routerResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a router assistant. Analyze the user's email request and classify it as either "sales" or "follow-up".

Sales: Generate sales emails, business proposals, product pitches, meeting requests for business purposes.
Follow-up: Generate follow-up emails, check-ins, reminders, or status updates.

Respond with ONLY one word: "sales" or "follow-up"`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
        });

        const classification = routerResponse.choices[0]?.message?.content
          ?.toLowerCase()
          .trim();

        let systemPrompt = '';
        if (classification === 'sales') {
          systemPrompt = `You are a sales email assistant. Generate professional, concise sales emails.
- Keep emails under 40 words total (readable in under 10 seconds)
- Use 7-10 words per sentence maximum
- Be direct and compelling
- Include a clear call to action
- Return JSON with "subject" and "body" fields only`;
        } else {
          systemPrompt = `You are a follow-up email assistant. Generate polite, professional follow-up emails.
- Keep tone friendly but professional  
- Be concise and respectful of recipient's time
- Include appropriate context
- Return JSON with "subject" and "body" fields only`;
        }

        // Generate the email content
        const emailResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
        });

        const emailContent = emailResponse.choices[0]?.message?.content;

        try {
          const parsedContent = JSON.parse(emailContent || '{}');
          return {
            subject: parsedContent.subject || '',
            body: parsedContent.body || '',
            type: classification,
          };
        } catch (parseError) {
          // Fallback if JSON parsing fails
          return {
            subject: `Re: ${prompt}`,
            body: emailContent || '',
            type: classification,
          };
        }
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Failed to generate email' });
      }
    }
  );

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
  fastify.get<{ Params: { id: string } }>(
    '/emails/:id',
    async (request, reply) => {
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
    }
  );

  // Create new email
  fastify.post<{ Body: Omit<Email, 'id' | 'created_at' | 'updated_at'> }>(
    '/emails',
    async (request, reply) => {
      try {
        const emailData = request.body;

        // Validate required fields
        if (!emailData.to || !emailData.subject || !emailData.body) {
          reply
            .status(400)
            .send({ error: 'Missing required fields: to, subject, body' });
          return;
        }

        // Email validation function
        const validateEmail = (email: string): boolean => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email.trim());
        };

        const validateEmailField = (
          emails: string
        ): { isValid: boolean; invalidEmails: string[] } => {
          if (!emails || emails.trim() === '') {
            return { isValid: true, invalidEmails: [] };
          }

          const emailList = emails.split(',').map((email) => email.trim());
          const invalidEmails = emailList.filter(
            (email) => email && !validateEmail(email)
          );

          return {
            isValid: invalidEmails.length === 0,
            invalidEmails,
          };
        };

        // Validate TO field (required)
        if (!validateEmail(emailData.to)) {
          reply
            .status(400)
            .send({ error: 'Invalid email address in TO field' });
          return;
        }

        // Validate CC field if provided
        if (emailData.cc && emailData.cc.trim()) {
          const ccValidation = validateEmailField(emailData.cc);
          if (!ccValidation.isValid) {
            reply.status(400).send({
              error: `Invalid email addresses in CC field: ${ccValidation.invalidEmails.join(', ')}`,
            });
            return;
          }
        }

        // Validate BCC field if provided
        if (emailData.bcc && emailData.bcc.trim()) {
          const bccValidation = validateEmailField(emailData.bcc);
          if (!bccValidation.isValid) {
            reply.status(400).send({
              error: `Invalid email addresses in BCC field: ${bccValidation.invalidEmails.join(', ')}`,
            });
            return;
          }
        }

        const [emailId] = await DB.createEmail(emailData);
        const createdEmail = await DB.getEmailById(emailId);

        reply.status(201).send(createdEmail);
      } catch (error) {
        reply.status(500).send({ error: 'Failed to create email' });
      }
    }
  );

  // Update email
  fastify.put<{
    Params: { id: string };
    Body: Partial<Omit<Email, 'id' | 'created_at' | 'updated_at'>>;
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
  fastify.delete<{ Params: { id: string } }>(
    '/emails/:id',
    async (request, reply) => {
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
    }
  );
};

export default routes;
