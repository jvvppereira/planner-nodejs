import type { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "../lib/prisma";
import nodemailer from "nodemailer"
import { getMailClient } from "../lib/mail";
import { formatDate } from "../lib/formatDate";

export async function createTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips', {
        schema: {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),
                ends_at: z.coerce.date(),
                owner_name: z.string(),
                owner_email: z.string().email(),
                emails_to_invite: z.array(z.string().email())
            })
        }
    }, async (request) => {
        const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body;

        if (starts_at < new Date()) {
            throw new Error('invalid start date')
        }

        if (ends_at < starts_at) {
            throw new Error('invalid end date')
        }

        const trip = await prisma.trip.create({
            data: {
                destination,
                starts_at,
                ends_at,
                participants: {
                    createMany: {
                        data: [
                            {
                                name: owner_name,
                                email: owner_email,
                                is_owner: true,
                                is_confirmed: true
                            },
                            ...emails_to_invite.map(email => { return { email } })
                        ]
                    }
                }
            }
        });

        const confirmationLink = `http://localhost:3000/trips/${trip.id}/confirm`

        const mail = await getMailClient();

        const formattedStartDate = formatDate(starts_at);
        const formattedEndDate = formatDate(ends_at);

        const message = await mail.sendMail({
            from: {
                name: "planner team",
                address: "team@planner.org"
            },
            to: {
                name: owner_name,
                address: owner_email,
            },
            subject: "Confirm your trip!",
            html: `
                <div style="font-family: sans-serif; font-size: 20px; line-heigth> 1.6;">
                <p>Confirm your trip to <strong>${destination}</strong> from <strong>${formattedStartDate}</strong> to <strong>${formattedEndDate}</strong>.</p>
                <p></p>
                <p>Click on this link to agree with the terms: <a href="${confirmationLink}">I agree!</a></p>
                </div>
            `.trim()
        });

        console.log(nodemailer.getTestMessageUrl(message));

        return {
            tripId: trip.id
        }
    })
}