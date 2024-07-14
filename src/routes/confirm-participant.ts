import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from 'zod'
import { prisma } from "../lib/prisma";
import { ClientError } from "../../errors/client-error";
import { env } from "../env";

export async function confirmParticipant(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/participants/:participantId/confirm', {
        schema: {
            params: z.object({
                participantId: z.string().uuid()
            })
        }
    }, async (request, response) => {
        const { participantId } = request.params;

        const participant = await prisma.participant.findUnique({
            where: {
                id: participantId
            },
        })


        if (!participant) {
            throw new ClientError('participant not found')
        }

        if (participant.is_confirmed) {
            return response.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)
        }

        await prisma.participant.update({
            where: { id: participantId },
            data: { is_confirmed: true }
        })

        return response.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`)
    });
};