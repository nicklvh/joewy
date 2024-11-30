import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  BucketScope,
  container,
  SapphireClient,
} from "@sapphire/framework";
import { GatewayIntentBits, Partials } from "discord.js";

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
  partials: [
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
  defaultCooldown: {
    delay: 3000, // 3 seconds
    limit: 2,
    scope: BucketScope.User,
  },
});

client.login(process.env.TOKEN).catch((error) => {
  container.logger.error(error);
});

const prisma = new PrismaClient();
container.prisma = prisma;

prisma
  .$connect()
  .then(() => {
    container.logger.info("Connected to the database successfully!");
  })
  .catch((error) => {
    container.logger.error(error);
  });