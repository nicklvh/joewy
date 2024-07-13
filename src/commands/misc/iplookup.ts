import { Command } from "@sapphire/framework";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import { EmbedBuilder } from "discord.js";

export class ServerInfoCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, {
      ...options,
      name: "iplookup",
      description: "shows information about an ip address",
    });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName("ip")
              .setDescription("The ip address to lookup")
              .setRequired(true)
          ),
      { idHints: ["1261706053960204351"] }
    );
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const ip = interaction.options.getString("ip", true);

    if (
      !ip.match(
        "((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])"
      ) &&
      !ip.match(
        "(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))"
      )
    ) {
      return interaction.reply("Invalid ip address");
    }

    const res: any = await fetch(
      `http://ip-api.com/json/${ip}?fields=156435`,
      FetchResultTypes.JSON
    );

    if (res.status !== "success") {
      return interaction.reply("Failed to lookup ip address");
    }

    const embed = new EmbedBuilder().setTitle("IP Lookup").addFields([
      {
        name: "IP Address",
        value: `\`${res.query}\``,
      },
      {
        name: "Country",
        value: `\`${res.country}\` (\`${res.countryCode}\`)`,
      },
      {
        name: "City",
        value: `\`${res.city}\``,
      },
      {
        name: "ISP",
        value: `\`${res.isp}\``,
      },
      {
        name: "VPN/TOR",
        value: `\`${res.proxy}\``,
      },
    ]);

    return interaction.reply({ embeds: [embed] });
  }
}
