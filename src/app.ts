import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fjwt from '@fastify/jwt';
import userRoutes from './modules/user/user.route';
import { userSchemas } from './modules/user/user.schema';
import { productSchemas } from './modules/product/product.schema';
import productRoutes from './modules/product/product.route';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import path from 'path';
import fastifyStatic from '@fastify/static';

export const server = Fastify({
    ajv: {
        plugins: [ajvErrors],
        customOptions: {
            allErrors: true
        }
    }
});

declare module "fastify" {
    export interface FastifyInstance {
        authenticate: any;
    }
}

declare module "@fastify/jwt" {
    interface FastifyJWT {
        user: {
            id: number,
            email: string,
            name: string
        }
    }
}

server.register(fjwt, {
    secret: 'hehefastifytest',
});

server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (error) {
        return reply.send(error);
    }
})

server.get('/healthcheck', async function (request, response) {
    return {
        status: 'ok'
    }
})

async function main() {

    for (const schema of [...userSchemas, ...productSchemas]) {
        server.addSchema(schema);
    }

    server.register(userRoutes, { prefix: 'api/users' })
    server.register(productRoutes, { prefix: 'api/products' })

    server.register(fastifyStatic, {
        root: path.join(__dirname, '../public'),
        prefix: '/'
    })

    try {
        await server.listen({ port: 8080, host: '0.0.0.0' });
        console.log(`Server ready at http://localhost:8080`)
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main()