import { Command } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { capitaliseFirstLetter } from '@lib/utils';

@ApplyOptions<Command.Options>({
  name: 'infractions',
  description: 'show all of a members infractions, warns/bans/mutes/kicks...',
  requiredUserPermissions: [PermissionFlagsBits.ManageMessages],
  runIn: 'GUILD_ANY',
})
export class InfractionsCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => {
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('the user to show infractions for')
              .setRequired(false),
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);
      },
      { idHints: ['1175550972718747740'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const user = interaction.options.getUser('user', false) ?? interaction.user;

    const message = new PaginatedMessage().setActions(
      PaginatedMessage.defaultActions.filter(
        (action) =>
          'customId' in action &&
          [
            '@sapphire/paginated-messages.previousPage',
            '@sapphire/paginated-messages.stop',
            '@sapphire/paginated-messages.nextPage',
          ].includes(action.customId),
      ),
    );

    let guildInDB = await this.container.prisma.guild.findUnique({
      where: {
        id: interaction.guildId!,
      },
    });

    if (!guildInDB) {
      guildInDB = await this.container.prisma.guild.create({
        data: {
          id: interaction.guildId!,
        },
      });
    }

    const infractions = await this.container.prisma.modlog.findMany({
      where: {
        memberId: user.id,
        Guild: guildInDB,
        guildId: interaction.guildId!,
      },
    });

    if (!infractions || !infractions.length) {
      return interaction.reply({
        content: 'This user has no infractions',
        ephemeral: true,
      });
    }

    for (const infraction of infractions) {
      message.addPageEmbed((embed) => {
        return embed.setTitle(`Infraction #${infraction.caseId}`).addFields([
          {
            name: 'Moderator',
            value: `<@${infraction.moderatorId}>`,
            inline: true,
          },
          {
            name: 'Reason',
            value: infraction.reason,
            inline: true,
          },
          {
            name: 'Type',
            value: capitaliseFirstLetter(infraction.type),
            inline: false,
          },
          {
            name: 'Date',
            value: `<t:${infraction.createdAt.getMilliseconds()}:f>`,
            inline: true,
          },
        ]);
      });
    }

    return message.run(interaction);
  }
}
