import { ModerationManager } from './lib';
import { PrismaClient } from '@prisma/client';
import 'module-alias/register';
import '@sapphire/plugin-subcommands/register';
import '@kaname-png/plugin-env/register';
import {
  ApplicationCommandRegistries,
  LogLevel,
  RegisterBehavior,
  SapphireClient,
  container,
} from '@sapphire/framework';
import { join } from 'path';

async function start() {
  ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
    RegisterBehavior.BulkOverwrite,
  );

  const client = await new SapphireClient({
    intents: ['Guilds'],
    baseUserDirectory: join(process.cwd(), 'dist', 'core'),
    logger: {
      level: LogLevel.Info,
    },
    env: {
      enabled: true,
    },
  });

  await client.login(container.env.string('TOKEN'));

  const prisma = new PrismaClient();
  container.prisma = prisma;
  await prisma.$connect().then(() => {
    container.logger.info('Connected to Database successfully!');
  });

  const moderationManager = new ModerationManager();
  container.moderationManager = moderationManager;
}

void start();

declare module '@sapphire/pieces' {
  interface Container {
    prisma: PrismaClient;
    moderationManager: ModerationManager;
  }
}

declare module '@kaname-png/plugin-env' {
  interface EnvKeys {
    TOKEN: never;
  }
}
