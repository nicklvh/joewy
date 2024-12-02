import { PrismaClient } from "@prisma/client";
import { StarboardUtility } from "../utilities/starboard";

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
  }
}

declare module "@sapphire/plugin-utilities-store" {
  export interface Utilities {
    starboard: StarboardUtility;
  }
}
