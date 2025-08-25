import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/ping', async () => {
    return 'pong\n';
  });
};

export default routes;
