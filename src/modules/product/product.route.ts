import { FastifyInstance } from "fastify";
import { createProductHandler, deleteProductHandler, getProductHandler, getProductsHandler, updateProductHandler } from "./product.controller";
// import { $ref } from "./product_zod.schema";
import { createProductSchema, getProductSchema, productResponseSchema, productsResponseSchema, updateProductSchema } from "./product.schema";

async function productRoutes(server: FastifyInstance){
    server.post('/',{
        preHandler: [server.authenticate],
        schema: {
            body: createProductSchema,
            response: {
                201: productResponseSchema
            }
        }
    }, createProductHandler);

    server.get('/', {
        schema: {
            response: {
                200: productsResponseSchema
            }
        }
    }, getProductsHandler);

    server.get('/:id', {
        schema: {
            response: {
                200: getProductSchema
            }
        }
    }, getProductHandler);

    // Route to update a product by ID
    server.put('/:id', {
        preHandler: [server.authenticate],
        schema: {
            body: updateProductSchema,
            response: {
                200: productResponseSchema
            }
        }
    }, updateProductHandler);

    // Route to delete a product by ID
    server.delete('/:id', {
        preHandler: [server.authenticate],
        schema: {
            response: {
                204: {} // No response body for successful delete
            }
        }
    }, deleteProductHandler);
}

export default productRoutes;