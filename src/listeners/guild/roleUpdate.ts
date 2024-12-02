import { Events, Listener } from "@sapphire/framework";
import { EmbedBuilder, type Role, roleMention } from "discord.js";
import { LoggingTypes } from "../../types/types";
import logChecks from "../../lib/helpers/logChecks";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
  event: Events.GuildRoleUpdate,
})
export class RoleUpdateListener extends Listener {
  public async run(oldRole: Role, newRole: Role) {
    const channel = await logChecks(oldRole.guild, LoggingTypes.AUDITLOG);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Role Updated | ${newRole.name}`,
      })
      .addFields([
        {
          name: "Role",
          value: `Old Role: ${roleMention(oldRole.id)} New Role: ${roleMention(
            newRole.id,
          )} (\`${newRole.id}\`)`,
          inline: true,
        },
      ])
      .setColor(newRole.hexColor);

    const colorChanged = newRole.hexColor !== oldRole.hexColor;
    const hoistedChanged = newRole.hoist !== oldRole.hoist;
    const mentionableChanged = newRole.mentionable !== oldRole.mentionable;

    if (colorChanged) {
      embed.addFields([
        {
          name: "Color",
          value: `Old Color: ${oldRole.hexColor} New Color: ${newRole.hexColor}`,
          inline: true,
        },
      ]);
    }

    if (hoistedChanged) {
      embed.addFields([
        {
          name: "Hoisted",
          value: `Hoisted Before: ${
            oldRole.hoist ? "`Yes`" : "`No`"
          } Hoisted After: ${newRole.hoist ? "`Yes`" : "`No`"}`,
          inline: true,
        },
      ]);
    }

    if (mentionableChanged) {
      embed.addFields([
        {
          name: "Mentionable",
          value: `Mentionable Before: ${
            oldRole.mentionable ? "`Yes`" : "`No`"
          } Mentionable After: ${newRole.mentionable ? "`Yes`" : "`No`"}`,
          inline: true,
        },
      ]);
    }

    const permsRemoved: string[] = [];
    const permsAdded: string[] = [];

    oldRole.permissions.toArray().forEach((perm) => {
      if (!newRole.permissions.has(perm)) {
        permsRemoved.push(perm);
      }

      if (!oldRole.permissions.has(perm)) {
        permsAdded.push(perm);
      }
    });

    if (permsRemoved.length) {
      embed.addFields([
        {
          name: "Permissions Removed",
          value: permsRemoved.join(", "),
          inline: true,
        },
      ]);
    }

    if (permsAdded.length) {
      embed.addFields([
        {
          name: "Permissions Added",
          value: permsAdded.join(", "),
          inline: true,
        },
      ]);
    }

    return channel.send({
      embeds: [embed],
    });
  }
}
