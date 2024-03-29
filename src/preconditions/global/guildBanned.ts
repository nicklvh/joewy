import { ApplyOptions } from "@sapphire/decorators";
import { AllFlowsPrecondition } from "@sapphire/framework";
import type {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Message,
} from "discord.js";

@ApplyOptions<AllFlowsPrecondition.Options>({
  position: 20,
})
export class GuildBannedPrecondition extends AllFlowsPrecondition {
  public override chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.checkBanned(interaction.guildId);
  }

  public override contextMenuRun(interaction: ContextMenuCommandInteraction) {
    return this.checkBanned(interaction.guildId);
  }

  public override messageRun(message: Message) {
    return this.checkBanned(message.guildId);
  }

  private async checkBanned(guildId: string | null) {
    if (!guildId) return this.ok();

    const banned = await this.container.prisma.guild.findUnique({
      where: { id: guildId, banned: true },
    });

    if (!banned) return this.ok();

    return this.error({
      identifier: "guildBanned",
      message: "Your server has been banned from using Joewy.",
    });
  }
}
