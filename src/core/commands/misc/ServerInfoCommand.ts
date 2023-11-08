import { ApplyOptions } from '@sapphire/decorators';
import { type ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { ChannelType, EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'serverinfo',
  description: 'shows information about the server',
})
export class ServerInfoCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description),
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const roles = interaction.guild?.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((role) => role.toString());

    const members = interaction.guild?.members.cache;
    const channels = interaction.guild?.channels.cache;
    const emojis = interaction.guild?.emojis.cache;
    const owner = await interaction.guild?.fetchOwner();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `Server Info | ${interaction.guild?.name}`,
            iconURL: interaction.guild?.iconURL() || '',
          })
          .setColor('Blue')
          .addFields([
            {
              name: 'General',
              value: `**❯ Name:** \`${interaction.guild
                ?.name}\`\n**❯ ID:** \`${interaction.guild
                ?.id}\`\n**❯ Owner:** \`${owner!.user.tag}\` (\`${interaction
                .guild?.ownerId}\`)\n**❯ Boost Tier:** \`${
                interaction.guild?.premiumTier
                  ? `Tier ${interaction.guild?.premiumTier}`
                  : 'None'
              }\`\n**❯ Time Created:** <t:${(
                (interaction.guild?.createdTimestamp as number) / 1000
              ).toFixed(0)}:f>`,
              inline: true,
            },
            {
              name: 'Statistics',
              value: `**❯ Role Count:** \`${roles?.length}\`\n**❯ Emoji Count:** \`${emojis?.size}\`\n**❯ Regular Emoji Count:** \`${emojis?.filter(
                (emoji) => !emoji.animated,
              ).size}\`\n**❯ Animated Emoji Count:** \`${emojis?.filter(
                (emoji) => emoji.animated,
              ).size}\`\n**❯ Member Count:** \`${interaction.guild
                ?.memberCount}\`\n**❯ Humans:** \`${members?.filter(
                (member) => !member.user.bot,
              ).size}\`\n**❯ Bots:** \`${members?.filter(
                (member) => member.user.bot,
              ).size}\`\n**❯ Text Channels:** \`${channels?.filter(
                (channel) => channel.type === ChannelType.GuildText,
              ).size}\`\n**❯ Voice Channels:** \`${channels?.filter(
                (channel) => channel.type === ChannelType.GuildVoice,
              ).size}\`\n**❯ Boost Count:** \`${
                interaction.guild?.premiumSubscriptionCount || '0'
              }\``,
              inline: true,
            },
          ])
          .setTimestamp()
          .setFooter({ text: `ID: ${interaction.guild?.id}` }),
      ],
    });
  }
}
