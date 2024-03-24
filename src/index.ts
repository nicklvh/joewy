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
import { Helpers } from "./classes/Helpers.js";
import { Time } from "@sapphire/time-utilities";

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
  defaultCooldown: {
    delay: Time.Second * 3, // 3000 milliseconds
    limit: 2,
    scope: BucketScope.User,
  },
  logger: {
    depth: LogLevel.Debug,
  },
});

void client.login(process.env.TOKEN);

const prisma = new PrismaClient();
container.prisma = prisma;

const helpers = new Helpers();
container.helpers = helpers;

void prisma.$connect().then(() => {
  container.logger.info("Connected to the database successfully!");
});
