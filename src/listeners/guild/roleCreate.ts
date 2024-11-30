import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, type Role, roleMention } from "discord.js";
import { LoggingTypes } from "../../utils/types";
import logChecks from "../../utils/helpers/logChecks";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
  event: Events.GuildRoleCreate,
})
export class RoleCreateListener extends Listener {
  public async run(role: Role) {
    const channel = await logChecks(role.guild, LoggingTypes.AUDITLOG);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Role Created | ${role.name}`,
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
