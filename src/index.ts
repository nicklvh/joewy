import "@sapphire/plugin-logger/register";

import { PrismaClient } from "@prisma/client";
import {
  ApplicationCommandRegistries,
  RegisterBehavior,
  SapphireClient,
  container,
} from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

import { config } from "dotenv";
config();

async function start() {
  ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
    RegisterBehavior.Overwrite
  );

  const client = new SapphireClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildEmojisAndStickers,
    ],
  });

  await client.login();

  const prisma = new PrismaClient();
  container.prisma = prisma;

  await prisma.$connect().then(() => {
    container.logger.info("Connected to Database successfully!");
  });
}

void start();

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
  }
}
