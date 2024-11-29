import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, MessageReaction, User } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.MessageReactionAdd,
})
export class MessageReactionAddListener extends Listener {
  public async run(messageReaction: MessageReaction, user: User) {
    this.container.logger.info("hello");
    if (!messageReaction.message.guild || user.bot) return;

    this.container.logger.info(messageReaction.emoji.name);

    if (messageReaction.emoji.name === "⭐️") {
      const starboard = await this.container.prisma.starboard.findUnique({
        where: {
          guildId: messageReaction.message.guild.id,
        },
      });

      if (!starboard || !starboard.enabled || !starboard.channelId) return;

      const starboardChannel = await messageReaction.message.guild.channels.fetch(starboard.channelId);

      if (!starboardChannel) return;
      this.container.logger.info("hello");

      if (messageReaction.count >= starboard.starsRequired && !starboard.starredMessages.includes((messageReaction.message.id))) {
        if (!starboardChannel.isSendable()) return;

        this.container.logger.info("hello");

        await starboardChannel.send({
          embeds: [
            new EmbedBuilder().setTitle("⭐️").setDescription(messageReaction.message.content).setColor("Gold").setFooter({ text: `⭐️ ${messageReaction.count}`})
          ]
        });

        await this.container.prisma.starboard.update({
          where: {
            guildId: messageReaction.message.guild.id,
          },
          data: {
            starredMessages: {
              push: messageReaction.message.id,
            },
          },
        });
      }
    }
  }
}