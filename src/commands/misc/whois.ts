import { Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<Command.Options>({
  name: "whois",
  description: "shows information about a user",
})
export class WhoisCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("the user to show information about")
            .setRequired(false)
        )
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Whois | ${user.tag}`,
            iconURL: user.displayAvatarURL(),
          })
          .setColor(user.hexAccentColor ?? "Blue")
          .addFields([
            {
              name: "General",
              value: `**❯ Name:** \`${user.tag}\` (\`${
                user.id
              }\`)\n**❯ Bot:** \`${
                user.bot ? `Bot` : `Human`
              }\`\n**❯ Created:** <t:${(
                (user.createdTimestamp as number) / 1000
              ).toFixed(0)}:f>`,
            },
          ])

          .setFooter({ text: `ID: ${user.id}` }),
      ],
    });
  }
}
