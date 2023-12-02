import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-api/register';

import { PrismaClient } from '@prisma/client';
import {
  ApplicationCommandRegistries,
  LogLevel,
  RegisterBehavior,
  SapphireClient,
  container,
} from '@sapphire/framework';
import { GatewayIntentBits, OAuth2Scopes, Partials } from 'discord.js';
import { ModerationManager } from '#classes/index';
import { envParseNumber, envParseString, setup } from '@skyra/env-utilities';
import { join } from 'path';

process.env.NODE_ENV ??= 'development';
setup({ path: join(__dirname, '..', `.env.${process.env.NODE_ENV}.local`) });

async function start() {
  ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
    RegisterBehavior.BulkOverwrite,
  );

  const client = new SapphireClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [Partials.GuildMember, Partials.Reaction, Partials.User],
    logger: {
      level:
        process.env.NODE_ENV === 'production' ? LogLevel.Info : LogLevel.Debug,
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

  await client.login();

  const prisma = new PrismaClient();
  container.prisma = prisma;
  await prisma.$connect().then(() => {
    container.logger.info('Connected to Database successfully!');
  });

  const moderationManager = new ModerationManager();
  container.moderationManager = moderationManager;
}

void start();
