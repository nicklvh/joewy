import { PrismaClient } from "@prisma/client";

declare module "@sapphire/pieces" {
  interface Container {
    database: PrismaClient;
  }
}
