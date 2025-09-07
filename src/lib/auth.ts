import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true if you want to require email verification
        sendResetPassword: async ({ user, url }) => {
            // Implement password reset email sending here
            console.log(`Password reset for ${user.email}: ${url}`);
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: [
        process.env.BETTER_AUTH_URL || "http://localhost:3000",
        "http://localhost:3000", // Add localhost for development
    ],
    secret: process.env.BETTER_AUTH_SECRET!,
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    advanced: {
        generateId: () => crypto.randomUUID(), // Use crypto.randomUUID for better compatibility
    },
});

export type Session = typeof auth.$Infer.Session;