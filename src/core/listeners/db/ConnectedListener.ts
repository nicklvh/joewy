import { Listener } from '@sapphire/framework';
import { connection } from 'mongoose';

export class ConnectingListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      emitter: connection,
      event: 'connected',
    });
  }

  public run() {
    return this.container.logger.info(`Connected to MongoDB`);
  }
}
