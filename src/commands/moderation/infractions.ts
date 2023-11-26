import { Command } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { chunk } from '@sapphire/utilities';
import { ModerationTypeStrings } from '@lib/types';

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
        guildId: interaction.guildId!,
      },
    });

    const guildInfractions = await this.container.prisma.modlog.findMany({
      where: {
        guildId: interaction.guildId!,
      },
    });

    if (!infractions || !infractions.length) {
      return interaction.reply({
        content: 'This user has no infractions',
        ephemeral: true,
      });
    }

    for (const arr of chunk(infractions, 3)) {
      message.addPageEmbed((embed) => {
        embed
          .setAuthor({
            name: `Infractions for ${user.tag}`,
            iconURL: user.displayAvatarURL(),
          })
          .setColor('Blue');

        for (const infraction of arr) {
          const moderator = this.container.client.users.cache.get(
            infraction.moderatorId,
          );

          const id =
            guildInfractions.findIndex(
              (inf) => inf.createdAt === infraction.createdAt,
            ) + 1;

          embed.addFields([
            {
              name: `${ModerationTypeStrings[infraction.type]} - Case #${id}`,
              value: [
                `**Moderator:** ${moderator!} (\`${moderator!.id}\`)`,
                `**Reason:** \`${infraction.reason}\``,
                `**Date:** <t:${(infraction.createdAt.valueOf() / 1000).toFixed(
                  0,
                )}:f>`,
              ].join('\n'),
            },
          ]);
        }

        return embed;
      });
    }

    return message.run(interaction);
  }
}
