/* eslint-disable @typescript-eslint/no-base-to-string */
import { Command } from "@sapphire/framework";
import type { CommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { JoewyEmbed } from "../../structures";

const verificationLevels = {
  NONE: "None",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "(╯°□°）╯︵ ┻━┻",
  VERY_HIGH: "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻",
};

const premiumTiers = {
  NONE: "None",
  TIER_1: "Tier 1",
  TIER_2: "Tier 2",
  TIER_3: "Tier 3",
};

@ApplyOptions<Command.Options>({
  description: "Show info about the server",
  runIn: ["GUILD_ANY"],
  chatInputCommand: {
    register: true,
    idHints: ["964181473613717545"],
  },
})
export class ServerInfoCommand extends Command {
  public override async chatInputRun(interaction: CommandInteraction) {
    const roles = interaction.guild?.roles.cache
      .sort((a, b) => b.position - a.position)
      .filter((role) => role.id !== interaction.guild?.id)
      .map((role) => role.toString());
    const members = interaction.guild?.members.cache;
    const channels = interaction.guild?.channels.cache;
    const emojis = interaction.guild?.emojis.cache;

    await interaction.guild?.members.fetch();

    const owner = await interaction.guild?.members.fetch(
      interaction.guild.ownerId
    );

    console.log(
      `<t:${interaction.guild?.createdTimestamp.toString().substring(0, 11)}:D>`
    );

    const embed = new JoewyEmbed()
      .setAuthor({
        name: `Server Information | ${interaction.guild!.name}`,
        iconURL: interaction.guild!.iconURL()!,
      })
      .setThumbnail(interaction.guild!.iconURL()!)
      .addField(
        "General",
        [
          `**❯ Name:** \`${interaction.guild!.name}\``,
          `**❯ ID:** \`${interaction.guild!.id}\``,
          `**❯ Owner:** \`${owner?.user.tag}\` (\`${owner?.user.id}\`)`,
          `**❯ Boost Tier:** \`${
            premiumTiers[interaction.guild!.premiumTier]
          }\``,
          `**❯ Verification Level:** \`${
            verificationLevels[interaction.guild!.verificationLevel]
          }\``,
          `**❯ Time Created:** <t:${Math.round(
            interaction.guild!.createdTimestamp / 1000
          )}:D>`,
        ].join("\n")
      )
      .addField(
        "Statistics",
        [
          `**❯ Role Count:** \`${roles!.length}\``,
          `**❯ Emoji Count:** \`${emojis?.size}\``,
          `**❯ Regular Emoji Count:** \`${
            emojis?.filter((emoji) => !emoji.animated).size
          }\``,
          `**❯ Animated Emoji Count:** \`${
            emojis?.filter((emoji) => emoji.animated!).size
          }\``,
          `**❯ Member Count:** \`${interaction.guild!.memberCount}\``,
          `**❯ Humans:** \`${
            members?.filter((member) => !member.user.bot).size
          }\``,
          `**❯ Bots:** \`${
            members?.filter((member) => member.user.bot).size
          }\``,
          `**❯ Text Channels:** \`${
            channels?.filter((channel) => channel.type === "GUILD_TEXT").size
          }\``,
          `**❯ Voice Channels:** \`${
            channels?.filter((channel) => channel.type === "GUILD_VOICE").size
          }\``,
          `**❯ Boost Count:** \`${
            interaction.guild?.premiumSubscriptionCount || 0
          }\``,
        ].join("\n")
      )
      .addField(
        `Presence`,
        [
          `**❯ Online:** \`${
            members!.filter((member) => member.presence?.status === "online")
              .size
          }\``,
          `**❯ Idle:** \`${
            members!.filter((member) => member.presence?.status === "idle").size
          }\``,
          `**❯ Do Not Disturb:** \`${
            members!.filter((member) => member.presence?.status === "online")
              .size
          }\``,
          `**❯ Offline:** \`${
            members!.filter((member) => member.presence?.status === "online")
              .size
          }\``,
        ].join("\n")
      )
      .addField(
        `Roles [${roles!.length}]`,
        roles!.length < 10
          ? roles!.join(", ")
          : roles!.length > 10
          ? this.trimArray(roles!)
          : "None"
      );

    await interaction.reply({ embeds: [embed] });
  }

  private trimArray(arr: any[]) {
    if (arr.length > 10) {
      const len = arr.length - 10;
      arr = arr.slice(0, 10);
      arr.push(`${len} more...`);
    }

    return arr.join();
  }
}
