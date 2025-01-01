import { Utility } from "@sapphire/plugin-utilities-store";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Utility.Options>({
  name: "starboard",
})
export class StarboardUtility extends Utility {
  public async getStarboard(guildId: string) {
    let starboard = await this.container.prisma.starboard.findUnique({
      where: {
        guildId,
      },
    });

    if (!starboard)
      starboard = await this.container.prisma.starboard.create({
        data: {
          guildId,
        },
      });

    return starboard;
  }

  public async addMessageToDB(guildId: string, messageId: string) {
    return this.container.prisma.starboard.update({
      where: {
        guildId,
      },
      data: {
        starredMessages: {
          push: messageId,
        },
      },
    });
  }

  public async removeMessageFromDB(guildId: string, messageId: string) {
    const { starredMessages } = await this.getStarboard(guildId);

    await this.container.prisma.starboard.update({
      where: {
        guildId,
      },
      data: {
        starredMessages: {
          set: starredMessages.filter((id) => id !== messageId),
        },
      },
    });
  }
}
