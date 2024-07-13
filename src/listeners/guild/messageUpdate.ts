import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, type Message } from "discord.js";
import { logChecks, LoggingTypes } from "../../utils";

export class MessageUpdateListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.MessageUpdate,
    });
  }

  public async run(oldMessage: Message<true>, newMessage: Message<true>) {
    const channel = await logChecks(oldMessage.guild, LoggingTypes.AUDITLOG);
    if (!channel) return;

    if (oldMessage.content === newMessage.content || oldMessage.author.bot)
      return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Message Edited | ${oldMessage.author.tag}`,
        iconURL: oldMessage.author.displayAvatarURL(),
      })
      .addFields([
        {
          name: "Old Message",
          value: oldMessage.content,
          inline: true,
        },
        {
          name: "New Message",
          value: newMessage.content,
          inline: true,
        },
      ])
      .setColor("Blue");

    return channel.send({
      embeds: [embed],
    });
  }
}
