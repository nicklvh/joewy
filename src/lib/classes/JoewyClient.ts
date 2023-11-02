import {
  ApplicationCommandRegistries,
  BucketScope,
  LogLevel,
  RegisterBehavior,
  SapphireClient,
} from '@sapphire/framework';
import { join } from 'path';
import { connect } from 'mongoose';
import { Time } from '@sapphire/time-utilities';

export class JoewyClient extends SapphireClient {
  public constructor() {
    super({
      intents: ['Guilds'],
      baseUserDirectory: join(process.cwd(), 'dist', 'core'),
      logger: {
        level: LogLevel.Debug,
      },
      defaultCooldown: {
        scope: BucketScope.User,
        delay: Time.Second * 5,
      },
    });
  }

  public async start(token: string, databaseURI: string) {
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
      RegisterBehavior.Overwrite,
    );

    await super.login(token);
    await this.dbInit(databaseURI);
  }

  private async dbInit(databaseURI: string) {
    try {
      return await connect(databaseURI);
    } catch (error) {
      return this.logger.error(error);
    }
  }
}
