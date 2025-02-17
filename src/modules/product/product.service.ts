import prisma from "../../utils/prisma";
import { CreateProductInput, UpdateProductInput } from "./product.schema";
// import { CreateProductInput, UpdateProductInput } from "./product_zod.schema";

export async function createProduct(
    data: CreateProductInput & {ownerId: number}
) {
    return prisma.product.create({
        data,
    })
}

export function getProducts() {
    return prisma.product.findMany({
        select: {
            content: true,
            title: true,
            price: true,
            id: true,
            createdAt: true,
            updatedAt: true,
            owner: {
                select: {
                    name: true,
                    id: true
                }
            }
        }
    })
}

export async function getProduct(id: number) {
    return prisma.product.findUnique({
        where: {
            id
        },
        select: {
            content: true,
            title: true,
            price: true,
            id: true,
            createdAt: true,
            updatedAt: true,
            owner: {
                select: {
                    name: true,
                    id: true
                }
            }
        }
    })
}

// Service to update a product by ID
export async function updateProduct(id: number, data: UpdateProductInput) {
    return prisma.product.update({
        where: {
            id,
        },
        data,
    })
}

// Service to delete a product by ID
export async function deleteProduct(id: number) {
    return prisma.product.delete({
        where: {
            id,
        },
    })
}