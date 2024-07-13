import { Command } from "@sapphire/framework";

export class PingCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "ping",
      description: "shows latency between bot and discord",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) => builder.setName(this.name).setDescription(this.description),
      { idHints: ["1231947622739345450"] }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    return interaction.reply(`\`${interaction.client.ws.ping}ms\``);
  }
}
