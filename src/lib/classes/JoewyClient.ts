import { SapphireClient } from "@sapphire/framework";
import { join } from "path";
import { connect } from "mongoose";

export class JoewyClient extends SapphireClient {
  public constructor() {
    super({
      intents: ["Guilds"],
      baseUserDirectory: join(process.cwd(), "dist", "core"),
    });
  }

  public async start(token: string, databaseURI: string): Promise<string> {
    await this.dbInit(databaseURI);
    return super.login(token);
  }

  private dbInit(databaseURI: string) {
    return connect(databaseURI);
  }
}
