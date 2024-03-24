import { ModerationType } from "@prisma/client";
import { container } from "@sapphire/framework";
import {
  Guild,
  type GuildTextBasedChannel,
  ChatInputCommandInteraction,
  User,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { ModerationTypeNamesPast } from "../types/index.js";

export class Helpers {
  public async welcomeChecks(
    guild: Guild
  ): Promise<GuildTextBasedChannel | false> {
    const guildInDB = await container.prisma.guild.findUnique({
      where: {
        id: guild.id,
      },
    });

    if (!guildInDB || !guildInDB.logging || !guildInDB.welcomeId) return false;

    const welcomeChannel = await container.client.channels
      .fetch(guildInDB.welcomeId)
      .catch(() =>
        container.logger.error(
          `Invalid welcome channel ID for Guild ${guild.name} (${guild.id})`
        )
      );

    if (!welcomeChannel || !welcomeChannel.isTextBased()) return false;

    return welcomeChannel as GuildTextBasedChannel;
  }

  public async auditlogChecks(
    guild: Guild
  ): Promise<GuildTextBasedChannel | false> {
    const guildInDB = await container.prisma.guild.findUnique({
      where: {
        id: guild.id,
      },
    });

    if (!guildInDB || !guildInDB.logging || !guildInDB.auditlogId) return false;

    const loggingChannel = await container.client.channels
      .fetch(guildInDB.auditlogId)
      .catch(() =>
        container.logger.error(
          `Invalid logging channel ID for Guild ${guild.name} (${guild.id})`
        )
      );

    if (!loggingChannel || !loggingChannel.isTextBased()) return false;

    return loggingChannel as GuildTextBasedChannel;
  }

  public async handleModeration(
    type: ModerationType,
    interaction: ChatInputCommandInteraction,
    user: User,
    reason: string,
    days?: number
  ) {
    const { guild } = interaction;
    const moderator = interaction.user;

    if (days && type === ModerationType.BAN) {
      // Turn days into milliseconds
      days *= 86400000;

      // Create a new date containing the date of unban
      const dueDate = new Date().valueOf() + days;

      await container.prisma.ban.create({
        data: {
          guildId: guild!.id,
          memberId: user.id,
          dueUnban: new Date(dueDate),
        },
      });
    }

    await this.createModlogEntry(
      ModerationType[type],
      guild!.id,
      moderator.id,
      reason,
      user.id
    );
    await this.sendModMsgToUser(type, user, guild!, reason);
    await this.sendModMsgToModlog(type, guild!, user, moderator, reason);
  }

  private async sendModMsgToUser(
    type: ModerationType,
    user: User,
    guild: Guild,
    reason: string
  ) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `You have been ${ModerationTypeNamesPast[type]} from ${guild.name}`,
        iconURL: guild.iconURL() || undefined,
      })
      .addFields([
        {
          name: "Reason",
          value: `\`${
            reason.length > 100 ? `${reason.substring(0, 100)}...` : reason
          }\``,
        },
      ])
      .setColor("Blue")
      .setTimestamp();

    return user
      .send({ embeds: [embed] })
      .catch((error) => container.logger.error(error));
  }

  private async createModlogEntry(
    type: ModerationType,
    guildId: string,
    moderatorId: string,
    reason: string,
    memberId: string
  ) {
    return container.prisma.modlog.create({
      data: {
        guildId,
        type: ModerationType[type],
        moderatorId,
        reason,
        createdAt: new Date(),
        memberId,
      },
    });
  }

  private async sendModMsgToModlog(
    type: ModerationType,
    guild: Guild,
    user: User,
    moderator: User,
    reason: string
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
          }`
        )
      );

    if (!modlogChannel || modlogChannel!.type !== ChannelType.GuildText) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${ModerationTypeNamesPast[type]} ${user.tag}`,
        iconURL: user.displayAvatarURL(),
      })
      .addFields([
        {
          name: "Reason",
          value: `\`${reason}\``,
        },
        {
          name: "Moderator",
          value: `${moderator} (\`${moderator.id}\`)`,
        },
      ])
      .setColor("Blue")
      .setTimestamp();

    return modlogChannel.send({ embeds: [embed] });
  }
}
