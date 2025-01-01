import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { GuildTextBasedChannel, MessageReaction, User } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.MessageReactionAdd,
})
export class MessageReactionAddListener extends Listener {
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
      messageReaction.count < starboard.starsRequired ||
      starboard.starredMessages.includes(messageReaction.message.id) ||
      !starboard.channelId
    )
      return;

    await this.container.utilities.starboard.addMessageToDB(
      messageReaction.message.guild.id,
      messageReaction.message.id,
    );

    const channel = (await messageReaction.message.guild.channels
      .fetch(starboard.channelId)
      .catch(() => null)) as GuildTextBasedChannel;

    await channel.send(
      `${messageReaction.count} ⭐️ ${messageReaction.message.url}`,
    );
  }
}
