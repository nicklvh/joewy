import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, type Message } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.MessageDelete,
})
export class MessageDeleteListener extends Listener {
  public async run(message: Message<true>) {
    const channel = await this.container.helpers.auditlogChecks(message.guild);
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
