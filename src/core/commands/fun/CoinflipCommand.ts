import { ApplyOptions } from '@sapphire/decorators';
import { type ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'coinflip',
  description: 'flip! shows heads or tails 🪙',
})
export class CoinflipCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { idHints: ['1171942952705208390'] },
    );
  }

  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: 'Flip! 🪙',
            iconURL: interaction.user.avatarURL()!,
          })
          .addFields([
            {
              name: 'Result',
              value: `\`${Math.random() > 0.5 ? 'Heads' : 'Tails'}\``,
            },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
    });
  }
}
