export const createUserSchema = {
    $id: 'createUserSchema',
    type: 'object',
    required: ['email', 'name', 'password'],
    properties: {
        email: { 
            type: 'string', 
            format: 'email',
            errorMessage: {
                required: 'Trường email là bắt buộc',
                format: 'Email không đúng định dạng'
            } 
        },
        name: { type: 'string' },
        password: { type: 'string' }
    }
}

export const createUserResponseSchema = {
    $id: 'createUserResponseSchema',
    type: 'object',
    properties: {
        id: { type: 'number' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string', nullable: true },
    }
}

export const loginSchema = {
    $id: 'loginSchema',
    type: 'object',
    required: ['email', 'password'],
    properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
    }
}

export const loginResponseSchema = {
    $id: 'loginResponseSchema',
    type: 'object',
    properties: {
        accessToken: { type: 'string' },
    }
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface CreateUserInput {
    email: string;
    name: string;
    password: string;
}

export const userSchemas = [createUserSchema, createUserResponseSchema, loginSchema, loginResponseSchema];