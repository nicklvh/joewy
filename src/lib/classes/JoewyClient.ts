import {
  ApplicationCommandRegistries,
  RegisterBehavior,
  SapphireClient,
} from '@sapphire/framework';
import { join } from 'path';
import { connect } from 'mongoose';

export class JoewyClient extends SapphireClient {
  public constructor() {
    super({
      intents: ['Guilds'],
      baseUserDirectory: join(process.cwd(), 'dist', 'core'),
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
