import { Command, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  inlineCode,
} from "discord.js";
import { ModerationType } from "@prisma/client";
import { handleInfraction } from "../../utils";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "kick",
  description: "kick a member",
  requiredUserPermissions: [PermissionFlagsBits.KickMembers],
  requiredClientPermissions: [PermissionFlagsBits.KickMembers],
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class KickCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => {
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName("user")
              .setDescription("the user to kick")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("reason")
              .setDescription("the reason for the kick")
              .setRequired(false)
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);
      },
      { idHints: ["1180299697680822332"] }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<"cached">
  ) {
    const user = interaction.options.getUser("user", true);

    const errorEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Error!`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setColor("Blue");

    if (user.id === interaction.user.id) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `You cannot kick yourself, you silly goose!`
          ),
        ],
        ephemeral: true,
      });
    }

    const interactionMember = await interaction.guild.members.fetch(
      interaction.user.id
    );

    const member = await interaction.guild.members.fetch(user.id);

    if (!member) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `An error occured with finding the member.`
          ),
        ],
      });
    }

    if (
      (interactionMember.roles.highest <= member.roles.highest &&
        interaction.guild.ownerId !== interaction.user.id) ||
      (interaction.guild.ownerId === user.id &&
        interaction.guild.ownerId !== interaction.user.id) ||
      !member.kickable
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `You cannot kick ${user} because they either have a higher or equal positioned role than you or me, or they are the owner of the server!`
          ),
        ],
        ephemeral: true,
      });
    }

    let reason =
      interaction.options.getString("reason", false) ?? "No reason provided";

    reason =
      reason.length > 100
        ? (reason = `${reason.substring(0, 100)}...`)
        : reason;

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger);

    const proceedButton = new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      cancelButton,
      proceedButton
    );

    const message = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Do you want to proceed?`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(
            `Are you sure you want to kick ${user}?\n\nThis will be cancelled in 1 minute if you don't respond.`
          )
          .setColor("Blue"),
      ],
      components: [row],
      fetchReply: true,
    });

    try {
      const confirmation = await message.awaitMessageComponent({
        filter: (i) => interaction.user.id === i.user.id,
        time: 60000, // 1 min,
      });

      if (confirmation.customId === "confirm") {
        await handleInfraction(ModerationType.KICK, interaction, user, reason);

        await member.kick(reason);

        await confirmation.update({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Kicked ${user.tag}`,
                iconURL: user.displayAvatarURL(),
              })
              .addFields([
                {
                  name: "Reason",
                  value: inlineCode(reason),
                  inline: true,
                },
              ])
              .setColor("Blue"),
          ],
          components: [],
        });
      } else if (confirmation.customId === "cancel") {
        await confirmation.update({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Cancelled`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setDescription(`Cancelled kicking ${user}`)
              .setColor("Blue"),
          ],
          components: [],
        });
      }
    } catch {
      await interaction.editReply({
        embeds: [
          errorEmbed.setDescription(
            `You took too long to respond, so the kick has been cancelled.`
          ),
        ],
        components: [],
      });
    }
    // eslint-disable-next-line no-useless-return
    return;
  }
}
