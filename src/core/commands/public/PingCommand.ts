import { type ApplicationCommandRegistry, Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

export class PingCommand extends Command {
  public constructor(context: Command.Context, options: Command.Options) {
    super(context, {
      ...options,
      name: 'ping',
      description: 'pong! shows latency of the bot 🏓',
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry,
  ) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { idHints: ['1169722065427902535'] },
    );
  }

  public override chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: 'Pong! 🏓',
            iconURL: interaction.user.avatarURL()!,
          })
          .addFields([
            { name: 'Ping', value: `\`${this.container.client.ws.ping}ms\`` },
          ])
          .setColor('Blue')
          .setTimestamp(),
      ],
    });
  }
}
