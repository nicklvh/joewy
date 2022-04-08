import type { GuildMember, PermissionString } from "discord.js";

export const missingPerms = (member: GuildMember, perms: any): string => {
  const missingPerms: PermissionString[] | string[] = member.permissions
    .missing(perms)
    .map(
      (str: PermissionString): string =>
        `\`${str
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b(\w)/g, (char: string): string => char.toUpperCase())}\``
    );

  return missingPerms.length > 1
    ? `${missingPerms.slice(0, -1).join(", ")} and ${missingPerms.slice(-1)[0]}`
    : missingPerms[0];
};
