import { PrismaClient } from '@prisma/client';
import 'module-alias/register';
import '@sapphire/plugin-logger/register';
import { config } from 'dotenv';
config();
import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { join } from 'path';
import { GatewayIntentBits, Partials } from 'discord.js';
import { ModerationManager } from '@lib/classes';

const start = async () => {
  const client = new SapphireClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [Partials.GuildMember, Partials.Reaction, Partials.User],
    baseUserDirectory: join(process.cwd(), 'dist', 'core'),
    logger: {
      level: LogLevel.Debug,
    },
  });

  await client.login(process.env.TOKEN);

  const prisma = new PrismaClient();
  container.prisma = prisma;
  await prisma.$connect().then(() => {
    container.logger.info('Connected to Database successfully!');
  });

  const moderationManager = new ModerationManager();
  container.moderationManager = moderationManager;
};

void start();
