// ESM
import 'dotenv/config'; // Add this line at the very top
import Fastify from 'fastify';
import routes from './src/routes/index.js';

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
});

// Register CORS manually since @fastify/cors might not be installed
fastify.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    reply.send();
  }
});

fastify.register(routes);

fastify.listen({ port: process.env.PORT || 3001 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 Backend server is ready at ${address}`);
});
