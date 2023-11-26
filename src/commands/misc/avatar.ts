import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
  name: 'avatar',
  description: "shows a user's avatar",
})
export class AvatarCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName('user')
              .setDescription('the user to show the avatar of')
              .setRequired(false),
          )
          .addNumberOption((option) =>
            option
              .setName('size')
              .setDescription('the size of the avatar')
              .setRequired(false)
              .setChoices(
                { name: '16', value: 16 },
                { name: '32', value: 32 },
                { name: '64', value: 64 },
                { name: '128', value: 128 },
                { name: '256', value: 256 },
                { name: '512', value: 512 },
                { name: '1024', value: 1024 },
                { name: '2048', value: 2048 },
                { name: '4096', value: 4096 },
              ),
          ),
      { idHints: ['1171494645918875718'] },
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction,
  ) {
    const user = interaction.options.getUser('user', false) ?? interaction.user;
    const size: any = interaction.options.getNumber('size', false) ?? 1024;

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${user.username}'s avatar`,
            iconURL: user.avatarURL({ size }) || undefined,
          })
          .setColor('Blue')
          .setImage(user.avatarURL()),
      ],
    });
  }
}
