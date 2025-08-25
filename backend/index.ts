import Fastify from 'fastify';
import routes from './src/routes/index.js';

const fastify = Fastify({
  logger: true,
});

// Register CORS plugin
fastify.register(import('@fastify/cors'), {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow frontend to make requests
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

fastify.register(routes);

const port = Number(process.env.PORT ?? 3001);

fastify.listen({ port, host: '127.0.0.1' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
