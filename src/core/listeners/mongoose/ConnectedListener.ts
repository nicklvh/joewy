import { Listener } from "@sapphire/framework";
import mongoose from "mongoose";

// @FIXME: This is not working
export class ConnectingListener extends Listener {
  public constructor(context: Listener.Context, options: Listener.Options) {
    super(context, {
      ...options,
      emitter: mongoose.connection,
      event: "connected",
    });
  }

  public run() {
    return this.container.logger.info(`Connected to MongoDB`);
  }
}
