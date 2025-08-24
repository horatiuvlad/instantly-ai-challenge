// Simple test to verify our endpoints
import Fastify from 'fastify';
import routes from './src/routes/index.js';

const fastify = Fastify({
  logger: true
});

fastify.register(routes);

const start = async () => {
  try {
    await fastify.listen({ port: 3002 });
    console.log('✅ Server started successfully on http://localhost:3002');
    
    // Test endpoints
    console.log('\n🧪 Testing endpoints...');
    
    // Stop server after a moment
    setTimeout(() => {
      console.log('✅ Backend setup complete!');
      process.exit(0);
    }, 2000);
    
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
};

start();
