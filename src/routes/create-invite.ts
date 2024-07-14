import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma";
import { formatDate } from "../lib/formatDate";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"
import { ClientError } from "../../errors/client-error";
import { env } from "../env";

export async function createInvite(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites', {
        schema: {
            params: z.object({
                tripId: z.string().uuid()
            }),
            body: z.object({
                email: z.string().email()
            })
        }
    }, async (request) => {
        const { tripId } = request.params;
        const { email } = request.body;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        })

        if (!trip) {
            throw new ClientError('trip not found')
        }

        const participant = await prisma.participant.create({
            data: {
                email,
                trip_id: tripId
            }
        })

        const mail = await getMailClient();

        const formattedStartDate = formatDate(trip.starts_at);
        const formattedEndDate = formatDate(trip.ends_at);

        const confirmationLink = `${env.API_BASE_URL}/participants/${participant.id}/confirm`

        const message = await mail.sendMail({
            from: {
                name: "planner team",
                address: "team@planner.org"
            },
            to: participant.email,
            subject: "Confirm your trip!",
            html: `
                        <div style="font-family: sans-serif; font-size: 20px; line-heigth> 1.6;">
                        <p>You have been invited to a trip! Confirm your trip to <strong>${trip.destination}</strong> from <strong>${formattedStartDate}</strong> to <strong>${formattedEndDate}</strong>.</p>
                        <p></p>
                        <p>Click on this link to agree with the terms: <a href="${confirmationLink}">I agree!</a></p>
                        </div>
                    `.trim()
        });
        console.log(nodemailer.getTestMessageUrl(message));

        return {
            participantId: participant.id
        }
    })
}