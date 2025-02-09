import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: DefaultUser & { id?: string };
  }

  interface JWT {
    accessToken?: string;
  }
}
