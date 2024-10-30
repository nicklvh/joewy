import "@sapphire/plugin-logger/register";
import { config } from "dotenv";
config();
import { PrismaClient } from "@prisma/client";
import {
  BucketScope,
  LogLevel,
  SapphireClient,
  container,
} from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
  defaultCooldown: {
    delay: 3000, // 3 seconds
    limit: 2,
    scope: BucketScope.User,
  },
  logger: {
    level: LogLevel.Debug,
  },
});

void client.login(process.env.TOKEN);

const prisma = new PrismaClient();
container.prisma = prisma;

prisma.$connect().then(() => {
  container.logger.info("Connected to the database successfully!");
});

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
  }
}
