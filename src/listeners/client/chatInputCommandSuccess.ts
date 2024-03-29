import { ApplyOptions } from "@sapphire/decorators";
import {
  Events,
  Listener,
  type ChatInputCommandSuccessPayload,
} from "@sapphire/framework";

@ApplyOptions<Listener.Options>({
  event: Events.ChatInputCommandSuccess,
})
export class ChatInputCommandSuccessListener extends Listener {
  public async run({ command, interaction }: ChatInputCommandSuccessPayload) {
    this.container.logger.info(
      `The /${command.name} command was ran by ${interaction.user.tag} successfully.`
    );
  }
}
