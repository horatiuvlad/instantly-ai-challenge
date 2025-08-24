import { DB } from '../db/index.js';
import OpenAI from 'openai';

// Initialize OpenAI client (you'll need to set OPENAI_API_KEY environment variable)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// AI Assistant system prompts
const ROUTER_PROMPT = `You are a router assistant. Based on the user's email request, determine which type of assistant should handle it.

Respond with ONLY one word:
- "SALES" for sales-related emails, business development, pitches, or introducing products/services
- "FOLLOWUP" for follow-up emails, checking in, reminders, or continuing previous conversations

User request: `;

const SALES_PROMPT = `You are a sales email assistant. Generate concise, professional sales emails.

Rules:
- Keep total email under 40 words
- Maximum 7-10 words per sentence
- Be direct and value-focused
- Include a clear call to action

Generate both subject and body for this request: `;

const FOLLOWUP_PROMPT = `You are a follow-up email assistant. Generate polite, professional follow-up emails.

Rules:
- Keep it courteous and brief
- Reference previous interactions when relevant
- Maintain professional tone
- Include a gentle call to action

Generate both subject and body for this request: `;

export default async function routes(fastify, options) {
  // Health check
  fastify.get('/ping', async (request, reply) => {
    return 'pong\n';
  });

  // Email CRUD operations
  fastify.get('/emails', async (request, reply) => {
    try {
      const emails = await DB.getAllEmails();
      return { success: true, emails };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  fastify.get('/emails/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const email = await DB.getEmailById(id);
      
      if (!email) {
        reply.code(404);
        return { success: false, error: 'Email not found' };
      }
      
      return { success: true, email };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  fastify.post('/emails', async (request, reply) => {
    try {
      const emailData = request.body;
      
      // Basic validation
      if (!emailData.to || !emailData.subject) {
        reply.code(400);
        return { success: false, error: 'To and subject fields are required' };
      }
      
      const email = await DB.createEmail(emailData);
      return { success: true, email };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  fastify.put('/emails/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const emailData = request.body;
      
      const email = await DB.updateEmail(id, emailData);
      return { success: true, email };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  fastify.delete('/emails/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      await DB.deleteEmail(id);
      return { success: true, message: 'Email deleted' };
    } catch (error) {
      reply.code(500);
      return { success: false, error: error.message };
    }
  });

  // AI Email Generation
  fastify.post('/ai/generate-email', async (request, reply) => {
    try {
      const { prompt } = request.body;
      
      if (!prompt) {
        reply.code(400);
        return { success: false, error: 'Prompt is required' };
      }

      // Step 1: Route to appropriate assistant
      const routerResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: ROUTER_PROMPT + prompt
        }],
        max_tokens: 10,
        temperature: 0
      });

      const assistantType = routerResponse.choices[0].message.content.trim().toUpperCase();
      
      // Step 2: Generate email with appropriate assistant
      let systemPrompt;
      if (assistantType === 'SALES') {
        systemPrompt = SALES_PROMPT + prompt;
      } else {
        systemPrompt = FOLLOWUP_PROMPT + prompt;
      }

      const emailResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: systemPrompt
        }],
        max_tokens: 200,
        temperature: 0.7
      });

      const generatedContent = emailResponse.choices[0].message.content;
      
      // Parse subject and body from generated content
      const lines = generatedContent.split('\n').filter(line => line.trim());
      let subject = '';
      let body = '';
      
      // Look for subject line
      const subjectLine = lines.find(line => 
        line.toLowerCase().startsWith('subject:') || 
        line.toLowerCase().startsWith('subject line:')
      );
      
      if (subjectLine) {
        subject = subjectLine.replace(/^subject:?\s*/i, '').trim();
        body = lines.filter(line => 
          !line.toLowerCase().startsWith('subject') && 
          line.trim() !== ''
        ).join('\n');
      } else {
        // If no explicit subject found, use first line as subject
        subject = lines[0] || '';
        body = lines.slice(1).join('\n');
      }

      return {
        success: true,
        assistantType: assistantType.toLowerCase(),
        subject: subject,
        body: body.trim()
      };

    } catch (error) {
      console.error('AI Generation Error:', error);
      reply.code(500);
      return { success: false, error: 'Failed to generate email content' };
    }
  });

  // AI Email Generation with Streaming (for real-time updates)
  fastify.post('/ai/generate-email-stream', async (request, reply) => {
    try {
      const { prompt } = request.body;
      
      if (!prompt) {
        reply.code(400);
        return { success: false, error: 'Prompt is required' };
      }

      // Set up Server-Sent Events
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Step 1: Route to appropriate assistant
      const routerResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: ROUTER_PROMPT + prompt
        }],
        max_tokens: 10,
        temperature: 0
      });

      const assistantType = routerResponse.choices[0].message.content.trim().toUpperCase();
      
      // Send assistant type
      reply.raw.write(`data: ${JSON.stringify({ type: 'assistant', data: assistantType.toLowerCase() })}\n\n`);

      // Step 2: Generate email with streaming
      let systemPrompt;
      if (assistantType === 'SALES') {
        systemPrompt = SALES_PROMPT + prompt;
      } else {
        systemPrompt = FOLLOWUP_PROMPT + prompt;
      }

      const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: systemPrompt
        }],
        max_tokens: 200,
        temperature: 0.7,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          reply.raw.write(`data: ${JSON.stringify({ type: 'content', data: content })}\n\n`);
        }
      }

      reply.raw.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      reply.raw.end();

    } catch (error) {
      console.error('AI Streaming Error:', error);
      reply.raw.write(`data: ${JSON.stringify({ type: 'error', data: 'Failed to generate email content' })}\n\n`);
      reply.raw.end();
    }
  });
}
