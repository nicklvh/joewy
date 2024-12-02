import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-utilities-store/register";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Time } from "@sapphire/time-utilities";
import {
  ApplicationCommandRegistries,
  BucketScope,
  container,
  LogLevel,
  RegisterBehavior,
  SapphireClient,
} from "@sapphire/framework";
import { GatewayIntentBits, Partials } from "discord.js";

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
    delay: Time.Second * 3,
    limit: 2,
    scope: BucketScope.User,
  },
  logger: {
    level: LogLevel.Debug,
  },
});

client.login(process.env.TOKEN).catch((error) => {
  container.logger.error(error);
});

const prisma = new PrismaClient();
container.prisma = prisma;

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
  RegisterBehavior.BulkOverwrite,
);

prisma
  .$connect()
  .then(() => {
    container.logger.info("Connected to the database successfully!");
  })
  .catch((error) => {
    container.logger.error(error);
  });
