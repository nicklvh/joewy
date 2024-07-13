import {
  Events,
  Listener,
  type ChatInputCommandSuccessPayload,
} from "@sapphire/framework";

export class ChatInputCommandSuccessListener extends Listener {
  public constructor(
    context: Listener.LoaderContext,
    options: Listener.Options
  ) {
    super(context, {
      ...options,
      event: Events.ChatInputCommandSuccess,
    });
  }

  public async run({ command, interaction }: ChatInputCommandSuccessPayload) {
    this.container.logger.info(
      `The /${command.name} command was ran by ${interaction.user.tag} successfully.`
    );
  }
}
