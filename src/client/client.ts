import {
  SapphireClient,
  container,
  LogLevel,
  BucketScope,
  ApplicationCommandRegistries,
  RegisterBehavior,
} from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";

export class Client extends SapphireClient {
  public constructor() {
    super({
      intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_PRESENCES"],
      partials: ["MESSAGE", "GUILD_MEMBER", "USER", "CHANNEL", "REACTION"],
      presence: {
        status: "idle",
        activities: [
          {
            name: "with my code",
            type: "PLAYING",
          },
        ],
      },
      logger: {
        level: LogLevel.Info,
      },
      defaultCooldown: {
        delay: Time.Second * 5,
        limit: 1,
        scope: BucketScope.User,
        filteredUsers: [process.env.OWNER_ID!],
      },
      api: {
        auth: {
          id: process.env.DISCORD_ID!,
          secret: process.env.CLIENT_SECRET!,
          cookie: "AUTH",
          scopes: ["identify", "email", "guilds"],
          redirect: process.env.CALLBACK_URL!,
        },
        prefix: "api/",
        origin: "*",
        listenOptions: {
          port: 4444,
        },
      },
    });
  }

  public override async login(token: string) {
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
      RegisterBehavior.Overwrite
    );

    await container.database
      .$connect()
      .then(() => container.logger.info("Connected to database"));

    return super.login(token);
  }
}
