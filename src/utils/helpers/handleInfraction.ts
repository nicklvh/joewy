import { ModerationType } from "@prisma/client";
import { container } from "@sapphire/framework";
import { ChatInputCommandInteraction, EmbedBuilder, User } from "discord.js";
import logChecks from "./logChecks";
import { LoggingTypes, ModerationTypeNamesPast } from "../types";

export default async function handleInfraction(
  type: ModerationType,
  interaction: ChatInputCommandInteraction<"cached">,
  user: User,
  reason: string,
  days?: number
) {
  const {guild} = interaction;
  const moderator = interaction.user;

  if (days && type === ModerationType.BAN) {
    // Turn days into milliseconds
    days *= 86400000;

    // Create a new date containing the date of unban
    const dueDate = new Date().valueOf() + days;

    await container.prisma.ban.create({
      data: {
        guildId: guild.id,
        memberId: user.id,
        dueUnban: new Date(dueDate),
      },
    });
  }

  // Create infraction in the database
  await container.prisma.modlog.create({
    data: {
      guildId: guild.id,
      type: ModerationType[type],
      moderatorId: moderator.id,
      reason,
      createdAt: new Date(),
      memberId: user.id,
    },
  });

  // Send offending user a message
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `You have been ${ModerationTypeNamesPast[type]} from ${guild.name}`,
      iconURL: guild.iconURL() || undefined,
    })
    .addFields([
      {
        name: "Reason",
        value: `\`${reason.length > 100 ? `${reason.substring(0, 100)}...` : reason}\``,
      },
    ])
    .setColor("Blue")
    .setTimestamp();

  await user.send({embeds: [embed]}).catch(() => {
  });

  // Send modlog message
  const modlogChannel = await logChecks(guild, LoggingTypes.MODLOG);

  if (!modlogChannel) return;

  const modlogEmbed = new EmbedBuilder()
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

  return modlogChannel.send({embeds: [modlogEmbed]});
}
