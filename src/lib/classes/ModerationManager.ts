import {
  EmbedBuilder,
  type User,
  type Guild,
  ChannelType,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { container } from '@sapphire/framework';
import { ModerationType } from '@prisma/client';

export class ModerationManager {
  public async handleModeration(
    type: ModerationType,
    interaction: ChatInputCommandInteraction,
    user: User,
    reason: string,
  ) {
    const { guild } = interaction;
    const moderator = interaction.user;

    await this.createModlogEntry(
      ModerationType[type],
      guild!.id,
      moderator.id,
      reason,
      user.id,
    );
    await this.sendModerationMessageToUser(type, user, guild!, reason);
    await this.sendModerationMessageToModlog(
      type,
      guild!,
      user,
      moderator,
      reason,
    );
  }

  private async sendModerationMessageToUser(
    type: ModerationType,
    user: User,
    guild: Guild,
    reason: string,
  ) {
    const embed = new EmbedBuilder()
      .addFields([
        {
          name: 'Reason',
          value: `\`${
            reason.length > 100 ? `${reason.substring(0, 100)}...` : reason
          }\``,
        },
      ])
      .setColor('Blue')
      .setTimestamp();

    switch (type) {
      case ModerationType.BAN:
        embed.setAuthor({
          name: `You have been banned from ${guild.name}`,
          iconURL: guild.iconURL() || undefined,
        });
        break;
      case ModerationType.KICK:
        embed.setAuthor({
          name: `You have been kicked from ${guild.name}`,
          iconURL: guild.iconURL() || undefined,
        });
        break;
      case ModerationType.MUTE:
        embed.setAuthor({
          name: `You have been muted in ${guild.name}`,
          iconURL: guild.iconURL() || undefined,
        });
        break;
      case ModerationType.WARN:
        embed.setAuthor({
          name: `You have been warned in ${guild.name}`,
          iconURL: guild.iconURL() || undefined,
        });
    }

    return user
      .send({ embeds: [embed] })
      .catch((error) => container.logger.error(error));
  }

  private async createModlogEntry(
    type: ModerationType,
    guildId: string,
    moderatorId: string,
    reason: string,
    memberId: string,
  ) {
    return container.prisma.modlog.create({
      data: {
        guildId,
        memberId,
        type: ModerationType[type],
        moderatorId,
        reason,
        createdAt: new Date(),
      },
    });
  }

  private async sendModerationMessageToModlog(
    type: ModerationType,
    guild: Guild,
    user: User,
    moderator: User,
    reason: string,
  ) {
    let guildInDB = await container.prisma.guild.findUnique({
      where: {
        id: guild.id,
      },
    })!;

    if (!guildInDB) {
      guildInDB = await container.prisma.guild.create({
        data: {
          id: guild.id,
        },
      })!;
    }

    if (!guildInDB || !guildInDB.modlogId) return;

    const modlogChannel = await guild.channels
      .fetch(guildInDB.modlogId!)
      .catch(() =>
        container.logger.error(
          `[${guild.name} (${guild.id})] Could not fetch modlog channel ${
            guildInDB!.modlogId
          }`,
        ),
      );

    if (!modlogChannel || modlogChannel!.type !== ChannelType.GuildText) return;

    const embed = new EmbedBuilder()
      .addFields([
        {
          name: 'Reason',
          value: `\`${reason}\``,
        },
        {
          name: 'Moderator',
          value: `${moderator} (\`${moderator.id}\`)`,
        },
      ])
      .setColor('Blue')
      .setTimestamp();

    switch (type) {
      case ModerationType.BAN:
        embed.setAuthor({
          name: `Banned ${user.tag}`,
          iconURL: user.displayAvatarURL(),
        });
        break;
      case ModerationType.KICK:
        embed.setAuthor({
          name: `Kicked ${user.tag}`,
          iconURL: user.displayAvatarURL(),
        });
        break;
      case ModerationType.MUTE:
        embed.setAuthor({
          name: `Muted ${user.tag}`,
          iconURL: user.displayAvatarURL(),
        });
        break;
      case ModerationType.WARN:
        embed.setAuthor({
          name: `Warned ${user.tag}`,
          iconURL: user.displayAvatarURL(),
        });
        break;
    }

    return modlogChannel.send({ embeds: [embed] });
  }
}
