import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fjwt from '@fastify/jwt';
import userRoutes from './modules/user/user.route';
import { userSchemas } from './modules/user/user.schema';
import { productSchemas } from './modules/product/product.schema';
import productRoutes from './modules/product/product.route';
import ajvErrors from 'ajv-errors';
import path from 'path';
import fastifyStatic from '@fastify/static';

export const server = Fastify({
    ajv: {
        plugins: [ajvErrors],
        customOptions: {
            allErrors: true
        }
    },
    logger: {
        level: 'info',
        transport: {
            target: 'pino-pretty'
        }
    }
});

// Định nghĩa kiểu mở rộng cho FastifyInstance và FastifyJWT
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

// Cấu hình plugin JWT
server.register(fjwt, {
    secret: 'hehefastifytest',
});

// Tạo decorator authenticate
server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (error) {
        return reply.send(error);
    }
});

// Hàm đăng ký toàn bộ hook cho nhóm route cụ thể
async function registerHooks(instance: FastifyInstance) {
    instance.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
        instance.log.info({ reqId: request.id, method: request.method, url: request.url }, '\n==============--> onRequest');
    });

    instance.addHook('preParsing', async (request: FastifyRequest, reply: FastifyReply) => {
        instance.log.info({ reqId: request.id, method: request.method, url: request.url }, '--> preParsing');
    });

    instance.addHook('preValidation', async (request: FastifyRequest, reply: FastifyReply) => {
        instance.log.info({ reqId: request.id, method: request.method, url: request.url }, '--> preValidation');
    });

    instance.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
        instance.log.info({ reqId: request.id, method: request.method, url: request.url }, '--> preHandler');
    });

    instance.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
        instance.log.info({ reqId: request.id, method: request.method, url: request.url, statusCode: reply.statusCode }, '--> onSend');
        return payload;
    });

    instance.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
        instance.log.info({ reqId: request.id, method: request.method, url: request.url, statusCode: reply.statusCode }, '<-- onResponse');
    });

    instance.setErrorHandler(async (error, request, reply) => {
        instance.log.error({ reqId: request.id, method: request.method, url: request.url, error }, 'Error Handler');
        reply.send(error);
    });
}

async function main() {
    // Đăng ký các schema cho user và product
    for (const schema of [...userSchemas, ...productSchemas]) {
        server.addSchema(schema);
    }

    // Nhóm route cho /api/users với các hook riêng
    server.register(async (instance, opts) => {
        
        await registerHooks(instance);
        // Đăng ký các route liên quan đến user
        instance.register(userRoutes);
    }, { prefix: '/api/users' });

    // Nhóm route cho /api/products với các hook riêng
    server.register(async (instance, opts) => {
        
        await registerHooks(instance);
        // Đăng ký các route liên quan đến product
        instance.register(productRoutes);
    }, { prefix: '/api/products' });


    // Đăng ký static file
    server.register(fastifyStatic, {
        root: path.join(__dirname, '../public'),
        prefix: '/'
    });

    try {
        await server.listen({ port: 8080, host: '0.0.0.0' });
        console.log(`Server ready at http://localhost:8080`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();