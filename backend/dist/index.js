import Fastify from 'fastify';
import routes from './src/routes/index.js';
const fastify = Fastify({
    logger: true,
});
fastify.register(routes);
const port = Number(process.env.PORT ?? 3001);
fastify.listen({ port }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    // Server is now listening on ${address}
});
