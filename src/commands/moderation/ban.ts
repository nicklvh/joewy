import { Command } from '@sapphire/framework';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { Time } from '@sapphire/time-utilities';
import { ApplyOptions } from '@sapphire/decorators';
import { ModerationType } from '@prisma/client';

@ApplyOptions<Command.Options>({
  name: 'ban',
  description: 'ban a member 🔨',
  requiredUserPermissions: [PermissionFlagsBits.BanMembers],
  requiredClientPermissions: [PermissionFlagsBits.BanMembers],
  runIn: 'GUILD_ANY',
})
export class BanCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => {
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('the user to ban')
              .setRequired(true),
          )
          .addStringOption((option) =>
            option
              .setName('reason')
              .setDescription('the reason for the ban')
              .setRequired(false),
          )
          .addIntegerOption((option) =>
            option
              .setName('days')
              .setDescription(
                'the amount of days to ban the user for, default is a perma ban',
              )
              .setRequired(false)
              .addChoices(
                {
                  name: '1 day',
                  value: 1,
                },
                {
                  name: '1 week',
                  value: 7,
                },
                {
                  name: '2 weeks',
                  value: 14,
                },
                {
                  name: '1 month',
                  value: 28,
                },
              ),
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);
      },
      { idHints: ['1169766210443956264'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const user = interaction.options.getUser('user', true);

    const errorEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Error!`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setColor('Blue');

    if (user.id === interaction.user.id) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `You cannot ban yourself, you silly goose!`,
          ),
        ],
        ephemeral: true,
      });
    }

    const interactionMember = await interaction.guild?.members.fetch(
      interaction.user.id,
    );

    const member = await interaction.guild?.members.fetch(user.id);

    if (!member) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `An error occured with finding the member.`,
          ),
        ],
      });
    }

    if (
      (interactionMember!.roles.highest <= member!.roles.highest &&
        interaction.guild?.ownerId !== interaction.user.id) ||
      (interaction.guild?.ownerId === user.id &&
        interaction.guild.ownerId !== interaction.user.id)
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `You cannot ban ${user} because they either have a higher or equal positioned role than you, or they are the owner of the server!`,
          ),
        ],
        ephemeral: true,
      });
    }

    let reason =
      interaction.options.getString('reason', false) ?? 'No reason provided';

    reason =
      reason.length > 100
        ? (reason = `${reason.substring(0, 100)}...`)
        : reason;

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger);

    const proceedButton = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Confirm')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      cancelButton,
      proceedButton,
    );

    const message = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Do you want to proceed?`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(
            `Are you sure you want to ban ${user}?\n\nThis will be cancelled in 1 minute if you don't respond.`,
          )
          .setColor('Blue'),
      ],
      components: [row],
      fetchReply: true,
    });

    try {
      const confirmation = await message.awaitMessageComponent({
        filter: (i) => interaction.user.id === i.user.id,
        time: Time.Minute,
      });

      if (confirmation.customId === 'confirm') {
        await this.container.moderationManager.handleModeration(
          ModerationType.BAN,
          interaction,
          user,
          reason,
        );

        await interaction.guild?.bans.create(user, {
          reason,
        });

        return confirmation.update({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Banned ${user.tag}`,
                iconURL: user.displayAvatarURL(),
              })
              .addFields([
                {
                  name: 'Reason',
                  value: `\`${reason}\``,
                  inline: true,
                },
              ])
              .setColor('Blue'),
          ],
          components: [],
        });
      } else if (confirmation.customId === 'cancel') {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Cancelled`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setDescription(`Cancelled banning ${user}!`)
              .setColor('Blue'),
          ],
          components: [],
        });
      }
    } catch (e) {
      this.container.logger.error(e);

      return interaction.editReply({
        embeds: [
          errorEmbed.setDescription(
            `You took too long to respond, so the ban has been cancelled.`,
          ),
        ],
        components: [],
      });
    }
    // eslint-disable-next-line no-useless-return
    return;
  }
}