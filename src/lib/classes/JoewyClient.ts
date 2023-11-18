import {
  ApplicationCommandRegistries,
  RegisterBehavior,
  SapphireClient,
  container,
} from '@sapphire/framework';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { ModerationManager } from '.';

export class JoewyClient extends SapphireClient {
  public constructor() {
    super({
      intents: ['Guilds'],
      baseUserDirectory: join(process.cwd(), 'dist', 'core'),
    });
  }

  public async start(token: string) {
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
      RegisterBehavior.Overwrite,
    );

    await super.login(token);
    await this.dbInit();
  }

  private async dbInit() {
    const prisma = new PrismaClient();
    container.prisma = prisma;
    await prisma.$connect().then(() => {
      this.logger.info('Connected to MongoDB');
    });

    const moderationManager = new ModerationManager();
    container.moderationManager = moderationManager;
  }
}
