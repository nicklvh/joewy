import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, roleMention, type Role } from "discord.js";
import { logChecks, LoggingTypes } from "../../utils";

export class RoleDeleteListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.GuildRoleDelete,
    });
  }

  public async run(role: Role) {
    const channel = await logChecks(role.guild, LoggingTypes.AUDITLOG);
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
