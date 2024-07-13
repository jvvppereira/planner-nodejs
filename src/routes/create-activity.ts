import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma";

export async function createActivity(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/activities', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                title: z.string().min(4),
                occurs_at: z.coerce.date(),
            })
        }
    }, async (request) => {
        const { tripId } = request.params;
        const { title, occurs_at } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        })


        if (!trip) {
            throw new Error('trip not found')
        }


        if (occurs_at < trip.starts_at) {
            throw new Error('invalid activity date')
        }

        if (occurs_at > trip.ends_at) {
            throw new Error('invalid activity date')
        }

        const activity = await prisma.activity.create({
            data: {
                title,
                occurs_at,
                trip_id: tripId
            }
        })


        return {
            activityId: activity.id
        }
    })
}