import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { GuildTextBasedChannel, MessageReaction, User } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.MessageReactionRemove,
})
export class MessageReactionRemoveListener extends Listener {
  public async run(messageReaction: MessageReaction, user: User) {
    if (messageReaction.partial) await messageReaction.fetch();
    if (user.partial) await user.fetch();

    if (
      user.bot ||
      !messageReaction.message.guild ||
      messageReaction.emoji.name !== "⭐"
    )
      return;

    const starboard = await this.container.utilities.starboard.getStarboard(
      messageReaction.message.guild.id,
    );

    if (
      !starboard.enabled ||
      messageReaction.count > starboard.starsRequired ||
      !starboard.starredMessages.includes(messageReaction.message.id) ||
      !starboard.channelId
    )
      return;

    await this.container.utilities.starboard.removeMessageFromDB(
      messageReaction.message.guild.id,
      messageReaction.message.id,
    );

    const channel = (await messageReaction.message.guild.channels
      .fetch(starboard.channelId)
      .catch(() => null)) as GuildTextBasedChannel;

    const messages = await channel.messages.fetch();

    const message = messages.find(
      (m) =>
        m.embeds[0].footer &&
        m.embeds[0].footer.text.includes(messageReaction.message.id),
    );

    if (message) await message.delete();
  }
}
