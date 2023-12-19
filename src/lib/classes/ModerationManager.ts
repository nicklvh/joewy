import { ModerationType } from "@prisma/client";
import {
  ChatInputCommandInteraction,
  User,
  Guild,
  EmbedBuilder,
  ChannelType,
} from "discord.js";
import { ModerationTypeNames } from "../types";
import { container } from "@sapphire/framework";

export class ModerationManager {
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
    await this.sendModerationMessageToUser(type, user, guild!, reason);
    await this.sendModerationMessageToModlog(
      type,
      guild!,
      user,
      moderator,
      reason
    );
  }

  private async sendModerationMessageToUser(
    type: ModerationType,
    user: User,
    guild: Guild,
    reason: string
  ) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `You have been ${ModerationTypeNames[type]} from ${guild.name}`,
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

  private async sendModerationMessageToModlog(
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
        name: `${ModerationTypeNames[type]} ${user.tag}`,
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
