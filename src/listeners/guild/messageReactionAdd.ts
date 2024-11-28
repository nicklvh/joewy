import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { MessageReaction } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.MessageReactionAdd,
})
export class MessageReactionAddListener extends Listener {
  public async run(messageReaction: MessageReaction) {
    if (!messageReaction.message.guild) return;

    if (messageReaction.emoji.name === "⭐️") {
      const starboard = await this.container.prisma.starboard.findUnique({
        where: {
          guildId: messageReaction.message.guild.id,
        },
      });

      if (!starboard || !starboard.enabled || !starboard.channelId) return;

      const starboardChannel = await messageReaction.message.guild.channels.fetch(starboard.channelId);

      if (!starboardChannel) return;

      if (messageReaction.count >= starboard.starsRequired) {

      }
    }
  }
}