import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { EmbedBuilder, roleMention, type Role } from 'discord.js';

@ApplyOptions<Listener.Options>({
  event: Events.GuildRoleUpdate,
})
export class RoleUpdateListener extends Listener {
  public async run(oldRole: Role, newRole: Role) {
    const channel = await this.container.utils.auditlogChecks(oldRole.guild);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Role Updated | ${newRole.name}`,
      })
      .addFields([
        {
          name: 'Role',
          value: `Old Role: ${roleMention(oldRole.id)} New Role: ${roleMention(
            newRole.id,
          )} (\`${newRole.id}\`)`,
          inline: true,
        },
        {
          name: 'Color',
          value: `Old Color: ${oldRole.hexColor} New Color: ${newRole.hexColor}`,
          inline: true,
        },
        {
          name: 'Hoisted',
          value: `Hoisted Before: ${
            oldRole.hoist ? '`Yes`' : '`No`'
          } Hoisted After: ${newRole.hoist ? '`Yes`' : '`No`'}`,
          inline: true,
        },
        {
          name: 'Mentionable',
          value: `Mentionable Before: ${
            oldRole.mentionable ? '`Yes`' : '`No`'
          } Mentionable After: ${newRole.mentionable ? '`Yes`' : '`No`'}`,
          inline: true,
        },
      ])
      .setColor(newRole.hexColor);

    return channel.send({
      embeds: [embed],
    });
  }
}
