import Fastify from 'fastify';
import userRoutes from './modules/user/user.route';

const server = Fastify();

server.get('/healthcheck', async function(request, response) {
    return {
        status: 'ok'
    }
})

async function main() {
    server.register(userRoutes, {prefix: 'api/users'})

    try {
        await server.listen({ port: 8080, host: '0.0.0.0' });
        console.log(`Server ready at http://localhost:3000`)
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main()