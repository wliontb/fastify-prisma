import { FastifyReply, FastifyRequest } from "fastify";
import { createUser, findUserByEmail, findUsers } from "./user.service";
// import { CreateUserInput, LoginInput } from "./user_zod.schema";
import { verifyPassword } from "../../utils/hash";
import { server } from "../../app";
import { CreateUserInput, LoginInput } from "./user.schema";

export async function registerUserHandler(
    request: FastifyRequest<{
        Body: CreateUserInput
    }>,
    reply: FastifyReply
) {

    const body = request.body;

    try {
        const user = await createUser(body);

        return reply.code(201).send(user);
    } catch (error) {
        console.log(error);
        return reply.code(500).send(error);
    }
}

export async function loginHandler(request: FastifyRequest<{
    Body: LoginInput;
}>, reply: FastifyReply) {
    const body = request.body;
    //find a user by email
    const user = await findUserByEmail(body.email);

    if(!user){
        return reply.code(401).send({
            message: 'Invalid email or password'
        })
    }
    //verify password
    const correctPassword = verifyPassword({
        candidatePassword: body.password,
        salt: user.salt,
        hash: user.password
    })

    //generate access token
    if(correctPassword){
        const {password, salt, ...rest} = user

        return {
            accessToken: server.jwt.sign(rest)
        }
    }
    //respond
    return reply.code(401).send({
        message: 'Invalid email or password'
    })
}

export async function getUserHandler() {
    const users = await findUsers();

    return users;
}