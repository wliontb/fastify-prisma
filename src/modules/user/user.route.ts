import { FastifyInstance } from "fastify";
import { getUserHandler, loginHandler, registerUserHandler } from "./user.controller";
// import { $ref } from "./user_zod.schema";
import { createUserResponseSchema, createUserSchema, loginResponseSchema, loginSchema } from "./user.schema";

async function userRoutes(server: FastifyInstance){
    server.post('/',{
        schema: {
            body: createUserSchema,
            response: {
                201: createUserResponseSchema
            }
        }
    }, registerUserHandler)

    server.post('/login', {
        schema: {
            body: loginSchema,
            response: {
                200: loginResponseSchema
            }
        }
    }, loginHandler)

    server.get('/', {
        preHandler: [server.authenticate]
    }, getUserHandler)
}

export default userRoutes