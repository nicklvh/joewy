import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, MessageReaction, User } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.MessageReactionAdd,
})
export class MessageReactionAddListener extends Listener {
  public async run(messageReaction: MessageReaction, user: User) {
    if (!messageReaction.message.guild || user.bot) return;

    if (messageReaction.emoji.name === "⭐") {
      const starboard = await this.container.prisma.starboard.findUnique({
        where: {
          guildId: messageReaction.message.guild.id,
        },
      });

      if (!starboard || !starboard.enabled || !starboard.channelId) return;

      const starboardChannel = await messageReaction.message.guild.channels.fetch(starboard.channelId);

      if (!starboardChannel || !starboardChannel.isSendable()) return;

      if (messageReaction.count >= starboard.starsRequired && !starboard.starredMessages.includes((messageReaction.message.id))) {
        await starboardChannel.send({
          embeds: [
            new EmbedBuilder().setDescription(messageReaction.message.content).setColor("Gold").setFooter({text: `⭐️ ${messageReaction.count} - ${messageReaction.message.id}`})
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
      } else if (messageReaction.count < starboard.starsRequired && starboard.starredMessages.includes(messageReaction.message.id)) {
        await starboardChannel.messages.fetch();
        const starredMessage = starboardChannel.messages.cache.find((m) => m.embeds[0]?.footer?.text?.endsWith(messageReaction.message.id) && m.author.id === this.container.client.user!.id);

        if (!starredMessage || !starredMessage.deletable) return;

        await starredMessage.delete();

        await this.container.prisma.starboard.update({
          where: {
            guildId: messageReaction.message.guild.id,
          },
          data: {
            starredMessages: {
              set: starboard.starredMessages.filter((id) => id !== messageReaction.message.id),
            },
          },
        });
      }
    }
  }
}