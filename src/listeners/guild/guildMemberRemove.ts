import { ApplyOptions } from "@sapphire/decorators";
import { Listener, Events } from "@sapphire/framework";
import { EmbedBuilder, type GuildMember } from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.GuildMemberRemove,
})
export class GuildMemberRemoveListener extends Listener {
  public override async run(member: GuildMember) {
    const welcomeChannel = await this.container.helpers.welcomeChecks(
      member.guild
    );
    if (!welcomeChannel) return;

    const { guild } = member;

    return welcomeChannel
      .send({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Member Left | ${member.user.tag}`,
              iconURL: member.user.displayAvatarURL(),
            })
            .setDescription(`Goodbye ${member.user.toString()}!`)
            .addFields([
              {
                name: "User Created",
                value: `<t:${(
                  (member.user.createdTimestamp as number) / 1000
                ).toFixed(0)}:f>`,
              },
            ])
            .setColor("Red")
            .setFooter({ text: `ID: ${member.id}` })
            .setTimestamp(),
        ],
      })
      .catch(() => {
        this.container.logger.error(
          `I do not have permission to send a welcome message in channel (${welcomeChannel.id}) for Guild ${guild.name} (${guild.id})`
        );
      });
  }
}
