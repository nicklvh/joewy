import { PrismaClient } from '@prisma/client';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-api/register';
import 'module-alias/register';
import { config } from 'dotenv';
config();
import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, OAuth2Scopes, Partials } from 'discord.js';
import { ModerationManager } from '@lib/classes';
import { envParseNumber, envParseString, setup } from '@skyra/env-utilities';

setup();

const start = async () => {
  const client = new SapphireClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [Partials.GuildMember, Partials.Reaction, Partials.User],
    logger: {
      level: LogLevel.Debug,
    },
    api: {
      auth: {
        id: envParseString('CLIENT_ID'),
        cookie: envParseString('OAUTH_COOKIE'),
        secret: envParseString('CLIENT_SECRET'),
        scopes: [OAuth2Scopes.Identify, OAuth2Scopes.Guilds],
        redirect: envParseString('OAUTH_REDIRECT'),
      },
      prefix: envParseString('API_PREFIX'),
      origin: envParseString('API_ORIGIN'),
      listenOptions: {
        port: envParseNumber('API_PORT', 3000),
      },
    },
  });

  await client.login(envParseString('TOKEN'));

  const prisma = new PrismaClient();
  container.prisma = prisma;
  await prisma.$connect().then(() => {
    container.logger.info('Connected to Database successfully!');
  });

  const moderationManager = new ModerationManager();
  container.moderationManager = moderationManager;
};

void start();
