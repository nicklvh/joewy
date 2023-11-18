import {
  EmbedBuilder,
  type User,
  type Guild,
  ChannelType,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { container } from '@sapphire/framework';
import { TypeEnum } from '..';

export class ModerationManager {
  public async handleModeration(
    type: TypeEnum,
    interaction: ChatInputCommandInteraction,
    user: User,
    reason: string,
    evidence: string,
  ) {
    const { guild } = interaction;
    const moderator = interaction.user;

    await this.createModlogEntry(
      type,
      guild!.id,
      evidence,
      moderator.id,
      reason,
      user.id,
    );
    await this.sendModerationMessageToUser(
      type,
      user,
      guild!,
      reason,
      evidence,
    );
    await this.sendModerationMessageToModlog(
      type,
      guild!,
      user,
      moderator,
      reason,
      evidence,
    );
  }

  private async sendModerationMessageToUser(
    type: TypeEnum,
    user: User,
    guild: Guild,
    reason: string,
    evidence?: string,
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

    evidence
      ? embed.addFields([
          {
            name: 'Evidence',
            value: evidence,
            inline: true,
          },
        ])
      : undefined;

    switch (type) {
      case TypeEnum.Ban:
        embed.setAuthor({
          name: `You have been banned from ${guild.name}`,
          iconURL: guild.iconURL() || undefined,
        });
        break;
      case TypeEnum.Kick:
        embed.setAuthor({
          name: `You have been kicked from ${guild.name}`,
          iconURL: guild.iconURL() || undefined,
        });
        break;
      case TypeEnum.Mute:
        embed.setAuthor({
          name: `You have been muted in ${guild.name}`,
          iconURL: guild.iconURL() || undefined,
        });
        break;
      case TypeEnum.Warn:
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
    type: TypeEnum,
    guildId: string,
    evidence: string,
    moderatorId: string,
    reason: string,
    userId: string,
  ) {
    return container.prisma.modlog.create({
      data: {
        id: guildId,
        userId,
        evidence,
        type,
        moderatorId,
        reason,
        timestamp: new Date(),
      },
    });
  }

  private async sendModerationMessageToModlog(
    type: TypeEnum,
    guild: Guild,
    user: User,
    moderator: User,
    reason: string,
    evidence: string,
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

    const embed = new EmbedBuilder().setTimestamp();

    switch (type) {
      case TypeEnum.Ban:
        embed.setAuthor({
          name: `Banned ${user.tag}`,
          iconURL: user.displayAvatarURL(),
        });
        break;
      case TypeEnum.Kick:
        embed
          .setAuthor({
            name: `Kicked ${user.tag}`,
            iconURL: user.displayAvatarURL(),
          })
          .addFields([
            {
              name: 'Reason',
              value: reason,
            },
            {
              name: 'Evidence',
              value: evidence,
            },
            {
              name: 'Moderator',
              value: `${moderator} (${moderator.id})`,
            },
          ]);
        break;
      case TypeEnum.Mute:
        embed.setAuthor({
          name: `Muted ${user.tag}`,
          iconURL: user.displayAvatarURL(),
        });
        break;
      case TypeEnum.Warn:
        embed.setAuthor({
          name: `Warned ${user.tag}`,
          iconURL: user.displayAvatarURL(),
        });
        break;
    }

    return modlogChannel.send({ embeds: [embed] });
  }
}
