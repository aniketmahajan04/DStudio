import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      role: {
        type: ["USER", "ADMIN"],
        required: false,
        defaultValue: "USER",
        input: false, // only set in DB, not by signup
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL as string,

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Set default redirect URL after sign in
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
});

export { auth };
