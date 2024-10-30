import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, type Message } from "discord.js";
import { logChecks, LoggingTypes } from "../../utils";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
    event: Events.MessageUpdate,
})
export class MessageUpdateListener extends Listener {
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
