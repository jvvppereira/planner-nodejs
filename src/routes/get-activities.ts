import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma";
import { diffDates } from "../lib/diffDates";

export async function getActivities(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/activities', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            })
        }
    }, async (request) => {
        const { tripId } = request.params;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                activities: {
                    orderBy: {
                        occurs_at: 'asc'
                    }
                }
            }
        })


        if (!trip) {
            throw new Error('trip not found')
        }

        const diffBetweenStartEnd = diffDates(trip.starts_at, trip.ends_at);

        const activities = Array.from({ length: diffBetweenStartEnd + 1 }).map((_, index) => {
            const date = new Date(trip.starts_at.toDateString());
            date.setDate(date.getDate() + index)

            return {
                date,
                activities: trip.activities.filter(activity => {
                    return activity.occurs_at.toDateString() == date.toDateString()
                })
            }
        })

        return { activities }
    })
}