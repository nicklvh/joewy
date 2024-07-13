import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, type Message } from "discord.js";
import { logChecks, LoggingTypes } from "../../utils";

export class MessageDeleteListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.MessageDelete,
    });
  }

  public async run(message: Message<true>) {
    const channel = await logChecks(message.guild, LoggingTypes.AUDITLOG);
    if (!channel) return;

    if (message.author.bot) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Message Deleted | ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      })
      .addFields([
        {
          name: "Message Content",
          value: message.content,
          inline: true,
        },
      ])
      .setColor("Blue");

    return channel.send({
      embeds: [embed],
    });
  }
}
