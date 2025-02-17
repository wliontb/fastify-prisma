export const createProductSchema = {
    $id: 'createProductSchema',
    type: 'object',
    required: ['title', 'price'],
    properties: {
        title: { type: 'string' },
        price: { type: 'number' },
        content: { type: 'string' },
    }
}

export const productResponseSchema = {
    $id: 'productResponseSchema',
    type: 'object',
    properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        price: { type: 'number' },
        content: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
    }
}

export const productsResponseSchema = {
    $id: 'productsResponseSchema',
    type: 'array',
    items: productResponseSchema
}

// Schema for getting a single product (same as productResponseSchema)
export const getProductSchema = productResponseSchema;

// Schema for updating a product (making title, price, content optional)
export const updateProductSchema = {
    $id: 'updateProductSchema',
    type: 'object',
    properties: {
        title: { type: 'string' },
        price: { type: 'number' },
        content: { type: 'string' },
    }
}

export interface CreateProductInput {
    title: string;
    price: number;
    content?: string; // Optional content
}

// Define the TypeScript interface for UpdateProductInput
export interface UpdateProductInput {
    title?: string;     // Optional title
    price?: number;     // Optional price
    content?: string;   // Optional content
}

export const productSchemas = [
    createProductSchema, 
    productResponseSchema, 
    productsResponseSchema, 
    // getProductSchema, 
    updateProductSchema
];