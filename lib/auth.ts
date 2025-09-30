import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { AuthOptions, getServerSession, Session, User } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

import { prisma } from "@/lib/db";

const emailFrom = process.env.EMAIL_FROM ?? "";

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  auth:
    process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD
      ? {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        }
      : undefined,
});

const sendVerificationRequest = async ({
  identifier,
  url,
}: {
  identifier: string;
  url: string;
}) => {
  if (!emailFrom) {
    console.warn("EMAIL_FROM env variable not set; skipping email send");
    return;
  }

  await transport.sendMail({
    to: identifier,
    from: emailFrom,
    subject: "Sign in to Wine Journal",
    text: `Sign in to Wine Journal by clicking this link: ${url}`,
    html: `<p>Sign in to <strong>Wine Journal</strong> by clicking the button below:</p><p><a href="${url}">Sign In</a></p>`,
  });
};

export const authConfig: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin/verify",
  },
  providers: [
    EmailProvider({
      sendVerificationRequest,
      from: emailFrom,
      generateVerificationToken: () => randomBytes(32).toString("hex"),
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    session: async ({ session, user }: { session: Session; user: User }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
};

export const authOptions: AuthOptions = {
  ...authConfig,
};

export const getCurrentSession = () => getServerSession(authOptions);




