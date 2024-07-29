import { FastifyInstance } from "fastify";
import { ZodError } from "zod"
import { ClientError } from "../errors/client-error";

type FastifyErrorHandler = FastifyInstance['errorHandler'];

export const errorHandler: FastifyErrorHandler = (error, resquest, response) => {
    if (error instanceof ZodError) {
        return response.status(400).send({
            message: "invalid input",
            errors: error.flatten().fieldErrors
        })
    }

    if (error instanceof ClientError) {
        return response.status(400).send({
            message: error.message
        })
    }

    return response.status(500).send({ message: "internal server error" })
}