import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { MessageReaction, User } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.MessageReactionAdd,
})
export class MessageReactionAddListener extends Listener {
  public async run(messageReaction: MessageReaction, user: User) {
    if (messageReaction.partial) await messageReaction.fetch();
    if (user.partial) await user.fetch();

    if (user.bot || !messageReaction.message.guild) return;

    this.container.utilities;
  }
}
