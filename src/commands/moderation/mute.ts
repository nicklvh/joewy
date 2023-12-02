import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  inlineCode,
} from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { ModerationType } from '@prisma/client';
import { Time } from '@sapphire/time-utilities';

@ApplyOptions<Command.Options>({
  name: 'mute',
  description: 'mute a member',
  requiredUserPermissions: [PermissionFlagsBits.MuteMembers],
  requiredClientPermissions: [PermissionFlagsBits.MuteMembers],
  runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class MuteCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) => {
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('the user to mute')
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName('duration')
            .setDescription('the duration of the mute')
            .setRequired(true)
            .setChoices(
              {
                name: '1 minute',
                value: Time.Minute,
              },
              {
                name: '5 minutes',
                value: Time.Minute * 5,
              },
              {
                name: '10 minutes',
                value: Time.Minute * 10,
              },
              {
                name: '30 minutes',
                value: Time.Minute * 30,
              },
              {
                name: '1 hour',
                value: Time.Hour,
              },
              {
                name: '6 hours',
                value: Time.Hour * 6,
              },
              {
                name: '12 hours',
                value: Time.Hour * 12,
              },
              {
                name: '1 day',
                value: Time.Day,
              },
              {
                name: '3 days',
                value: Time.Day * 3,
              },
              {
                name: '1 week',
                value: Time.Week,
              },
              {
                name: '2 weeks',
                value: Time.Week * 2,
              },
              {
                name: '1 month',
                value: Time.Month,
              },
              {
                name: '3 months',
                value: Time.Month * 3,
              },
              {
                name: '6 months',
                value: Time.Month * 6,
              },
            ),
        )
        .addStringOption((option) =>
          option
            .setName('reason')
            .setDescription('the reason for the mute')
            .setRequired(false),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
    });
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction<'cached'>,
  ) {
    const user = interaction.options.getUser('user', true);
    const duration = interaction.options.getNumber('duration', true);

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
            `You cannot warn yourself, you silly goose!`,
          ),
        ],
        ephemeral: true,
      });
    }

    const interactionMember = await interaction.guild.members.fetch(
      interaction.user.id,
    );

    const member = await interaction.guild.members.fetch(user.id);

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
      (interactionMember.roles.highest <= member.roles.highest &&
        interaction.guild.ownerId !== interaction.user.id) ||
      (interaction.guild.ownerId === user.id &&
        interaction.guild.ownerId !== interaction.user.id) ||
      member.moderatable
    ) {
      return interaction.reply({
        embeds: [
          errorEmbed.setDescription(
            `You cannot mute ${user} because they either have a higher or equal positioned role than you or me, or they are the owner of the server!`,
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
            `Are you sure you want to mute ${user}?\n\nThis will be cancelled in 1 minute if you don't respond.`,
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
          ModerationType.MUTE,
          interaction,
          user,
          reason,
        );

        await member.timeout(duration, reason);

        await confirmation.update({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Muted ${user.tag}`,
                iconURL: user.displayAvatarURL(),
              })
              .addFields([
                {
                  name: 'Duration',
                  value: inlineCode(`${duration * Time.Minute}`),
                  inline: true,
                },
                {
                  name: 'Reason',
                  value: inlineCode(reason),
                  inline: true,
                },
              ])
              .setColor('Blue'),
          ],
          components: [],
        });
      } else if (confirmation.customId === 'cancel') {
        await confirmation.update({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Cancelled`,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setDescription(`Cancelled muting ${user}`)
              .setColor('Blue'),
          ],
          components: [],
        });
      }
    } catch {
      await interaction.editReply({
        embeds: [
          errorEmbed.setDescription(
            `You took too long to respond, so the warn has been cancelled.`,
          ),
        ],
        components: [],
      });
    }
    // eslint-disable-next-line no-useless-return
    return;
  }
}
