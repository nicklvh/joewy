import { ApplyOptions } from '@sapphire/decorators';
import {
  Events,
  Listener,
  type ChatInputCommandDeniedPayload,
  type UserError,
} from '@sapphire/framework';

@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandDenied,
})
export class ChatInputCommandDeniedCooldownListener extends Listener {
  public async run(
    error: UserError,
    { interaction }: ChatInputCommandDeniedPayload,
  ) {
    if (error.identifier === 'preconditionCooldown') {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: `Woah, slow down there! Try again in \`${
            // @ts-expect-error If statement checks if error is a cooldown error, so this is safe
            (error.context!.remaining / 1000).toFixed(1)
          } seconds\``,
        });
        return;
      }

      await interaction.reply({
        content: `Woah, slow down there! Try again in \`${
          // @ts-expect-error If statement checks if error is a cooldown error, so this is safe
          (error.context!.remaining / 1000).toFixed(1)
        } seconds\``,
        ephemeral: true,
      });
    }
  }
}
