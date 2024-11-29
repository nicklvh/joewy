import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { BucketScope, container, LogLevel, SapphireClient, } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

config();

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
  defaultCooldown: {
    delay: 3000, // 3 seconds
    limit: 2,
    scope: BucketScope.User,
  },
  logger: {
    level: LogLevel.Trace,
  }
});

client.login(process.env.TOKEN).catch((error) => {
  container.logger.error(error);
});

const prisma = new PrismaClient();
container.prisma = prisma;

prisma.$connect().then(() => {
  container.logger.info("Connected to the database successfully!");
}).catch((error) => {
  container.logger.error(error);
});

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
  }
}