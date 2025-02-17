import { FastifyReply, FastifyRequest } from "fastify";
import { CreateProductInput, UpdateProductInput } from "./product_zod.schema";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "./product.service";

export async function createProductHandler(
    request: FastifyRequest<{
        Body: CreateProductInput
    }>,
    reply: FastifyReply
) {
    const product = await createProduct({
        ...request.body,
        ownerId: request.user.id
    });

    return reply.code(201).send(product);
}

export async function getProductsHandler() {
    const products = await getProducts();

    return products;
}

export async function getProductHandler(
    request: FastifyRequest<{
        Params: { id: number }
    }>,
    reply: FastifyReply
) {
    const id = Number(request.params.id);
    const product = await getProduct(id);

    if (!product) {
        return reply.code(404).send({
            message: 'Product not found'
        })
    }

    return product;
}

// Handler to update a product by ID
export async function updateProductHandler(
    request: FastifyRequest<{
        Params: { id: number }, // Expecting 'id' as a route parameter
        Body: UpdateProductInput
    }>,
    reply: FastifyReply
) {
    const id = Number(request.params.id); // Convert id to number
    const product = await updateProduct(id, request.body);

    if (!product) {
        return reply.code(404).send({ message: 'Product not found' });
    }

    return product;
}

// Handler to delete a product by ID
export async function deleteProductHandler(
    request: FastifyRequest<{
        Params: { id: number } // Expecting 'id' as a route parameter
    }>,
    reply: FastifyReply
) {
    const id = Number(request.params.id); // Convert id to number
    await deleteProduct(id);

    return reply.code(204).send(); // Send 204 No Content for successful deletion
}