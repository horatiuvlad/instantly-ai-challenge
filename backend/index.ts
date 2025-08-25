import 'dotenv/config'; // Add this line at the very top
import Fastify from 'fastify';
import routes from './src/routes/index';
import routeApi from './src/routes/api/route';
import generateApi from './src/routes/api/generate';

const fastify = Fastify({
  logger: true,
});

fastify.register(routes);
fastify.register(routeApi);
fastify.register(generateApi);

const port = Number(process.env.PORT ?? 3001);

fastify.listen({ port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
