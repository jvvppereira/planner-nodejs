import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from 'zod'
import { prisma } from "../lib/prisma";
import { formatDate } from "../lib/formatDate";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"

export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            })
        }
    }, async (request, response) => {
        const { tripId } = request.params;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                participants: {
                    where: {
                        is_owner: false
                    }
                }
            }
        })


        if (!trip) {
            throw new Error('trip not found')
        }

        if (trip.is_confirmed) {
            return response.redirect(`http://localhost:4000/trips/${tripId}`)
        }

        await prisma.trip.update({
            where: { id: tripId },
            data: { is_confirmed: true }
        })

        const mail = await getMailClient();

        const formattedStartDate = formatDate(trip.starts_at);
        const formattedEndDate = formatDate(trip.ends_at);

        await Promise.all(
            trip.participants.map(async (participant) => {

                const confirmationLink = `http://localhost:3000/participants/${participant.id}}/confirm/`

                const message = await mail.sendMail({
                    from: {
                        name: "planner team",
                        address: "team@planner.org"
                    },
                    to: participant.email,
                    subject: "Confirm your trip!",
                    html: `
                        <div style="font-family: sans-serif; font-size: 20px; line-heigth> 1.6;">
                        <p>Ypou have been invited to a trip! Confirm your trip to <strong>${trip.destination}</strong> from <strong>${formattedStartDate}</strong> to <strong>${formattedEndDate}</strong>.</p>
                        <p></p>
                        <p>Click on this link to agree with the terms: <a href="${confirmationLink}">I agree!</a></p>
                        </div>
                    `.trim()
                });
                console.log(nodemailer.getTestMessageUrl(message));

            }
            )
        )

        return response.redirect(`http://localhost:4000/trips/${tripId}`)
    });
};