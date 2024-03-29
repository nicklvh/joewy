import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, roleMention, type Role } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.GuildRoleDelete,
})
export class RoleDeleteListener extends Listener {
  public async run(role: Role) {
    const channel = await this.container.helpers.auditlogChecks(role.guild);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Role Deleted | ${role.name}`,
      })
      .addFields([
        {
          name: "Role",
          value: `${roleMention(role.id)} (\`${role.id}\`)`,
          inline: true,
        },
        {
          name: "Color",
          value: role.hexColor,
          inline: true,
        },
        {
          name: "Hoisted",
          value: role.hoist ? "`Yes`" : "`No`",
          inline: true,
        },
        {
          name: "Mentionable",
          value: role.mentionable ? "`Yes`" : "`No`",
          inline: true,
        },
      ])
      .setColor(role.hexColor);

    return channel.send({
      embeds: [embed],
    });
  }
}
