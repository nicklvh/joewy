import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  EmbedBuilder,
  GuildTextBasedChannel,
  MessageReaction,
  User,
} from "discord.js";

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
      messageReaction.message.guild.id
    );

    if (
      starboard.enabled &&
      starboard.starredMessages.includes(messageReaction.message.id) &&
      messageReaction.count > starboard.starsRequired && starboard.channelId
    ) {
      const channel = (await messageReaction.message.guild.channels
        .fetch(starboard.channelId)
        .catch(() => null)) as GuildTextBasedChannel;

      const messages = await channel.messages.fetch();
      const starredMessage = messages.find((m) =>
        m.embeds.length
          ? m.embeds[0].footer?.text?.includes(messageReaction.message.id)
          : false
      );

      const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setDescription(
        messageReaction.message.content
          ? messageReaction.message.content.substring(0, 512)
          : ""
      )
      .setFooter({
        text: `⭐ ${messageReaction.count} | ${messageReaction.message.id}`,
      });

      starredMessage?.edit({ embeds: [embed]});
      return;
    }

    if (
      !starboard.enabled ||
      messageReaction.count < starboard.starsRequired ||
      starboard.starredMessages.includes(messageReaction.message.id) ||
      !starboard.channelId
    )
      return;

    await this.container.utilities.starboard.addMessageToDB(
      messageReaction.message.guild.id,
      messageReaction.message.id
    );

    const channel = (await messageReaction.message.guild.channels
      .fetch(starboard.channelId)
      .catch(() => null)) as GuildTextBasedChannel;

    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setDescription(
        messageReaction.message.content
          ? messageReaction.message.content.substring(0, 512)
          : ""
      )
      .setFooter({
        text: `⭐ ${messageReaction.count} | ${messageReaction.message.id}`,
      });

    await channel.send({ embeds: [embed] });
  }
}
