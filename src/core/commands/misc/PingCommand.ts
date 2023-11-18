import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'ping',
  description: 'pong! shows latency of the bot 🏓',
})
export class PingCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
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
