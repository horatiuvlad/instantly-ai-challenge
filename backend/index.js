// ESM
import Fastify from 'fastify';
import routes from './src/routes/index.js';

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(import('@fastify/cors'), {
  origin: true
});

fastify.register(routes);

fastify.listen({ port: process.env.PORT || 3001 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`🚀 Backend server is ready at ${address}`);
});
