import { z } from "zod";
import {buildJsonSchemas} from 'fastify-zod';

const productInput = {
    title: z.string(),
    price: z.number(),
    content: z.string().optional()
}

const productGenerated = {
    id: z.number(),
    createdAt: z.string(),
    updatedAt: z.string()
}

const createProductSchema = z.object({
    ...productInput
})
const productResponseSchema = z.object({
    ...productInput,
    ...productGenerated
})

const productsResponseSchema = z.array(productResponseSchema)

// Schema for getting a single product (same as productResponseSchema for simplicity)
const getProductSchema = productResponseSchema;

// Schema for updating a product (using partial of productInput, id is required in params)
const updateProductSchema = z.object({
    ...productInput // Make title, price, content optional for update
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export const {schemas: productSchemas, $ref} = buildJsonSchemas({
    createProductSchema,
    productResponseSchema,
    productsResponseSchema,
    getProductSchema,
    updateProductSchema
}, {
    $id: 'productSchema'
})