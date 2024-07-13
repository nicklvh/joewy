import { PrismaClient } from "@prisma/client";

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
  }
}
