import { ApplyOptions } from '@sapphire/decorators';
import { Listener, Events } from '@sapphire/framework';
import { EmbedBuilder, type GuildMember } from 'discord.js';

@ApplyOptions<Listener.Options>({
  event: Events.GuildMemberAdd,
})
export class GuildMemberAddListener extends Listener {
  public override async run(member: GuildMember) {
    const guildInDB = await this.container.prisma.guild.findUnique({
      where: {
        id: member.guild.id,
      },
    });

    const { guild } = member;

    if (!guildInDB) {
      await this.container.prisma.guild.create({
        data: {
          id: guild.id,
        },
      });
      return;
    }

    if (!guildInDB.welcomeId) return;

    const welcomeChannel = await this.container.client.channels
      .fetch(guildInDB.welcomeId)
      .catch(() =>
        this.container.logger.error(
          `Invalid welcome channel ID for Guild ${guild.name} (${guild.id})`,
        ),
      );

    if (!welcomeChannel || !welcomeChannel.isTextBased()) return;

    return welcomeChannel
      .send({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `New Member | ${member.user.tag}`,
              iconURL: member.user.displayAvatarURL(),
            })
            .setDescription(
              `Welcome to ${guild.name}, ${member.user.toString()}!`,
            )
            .addFields([
              {
                name: 'User Created',
                value: `<t:${(
                  (member.user.createdTimestamp as number) / 1000
                ).toFixed(0)}:f>`,
              },
            ])
            .setColor('Blue')
            .setFooter({ text: `ID: ${member.id}` })
            .setTimestamp(),
        ],
      })
      .catch(() => {
        this.container.logger.error(
          `I do not have permission to send a welcome message in channel (${welcomeChannel.id}) for Guild ${guild.name} (${guild.id})`,
        );
      });
  }
}
