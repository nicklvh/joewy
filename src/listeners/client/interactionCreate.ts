import { Listener, Events } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { JoewyEmbed } from "../../structures";
import {
  type Interaction,
  MessageActionRow,
  MessageButton,
  MessageSelectMenu,
} from "discord.js";

@ApplyOptions<Listener.Options>({
  event: Events.InteractionCreate,
})
export class InteractionCreateListener extends Listener {
  public async run(interaction: Interaction) {
    if (!interaction.isButton() && !interaction.isSelectMenu()) return;

    if (interaction.customId === "editmod") {
      const guild = await this.container.client.guilds.fetch(
        interaction.guild!.id
      );

      const embed = new JoewyEmbed(true)
        .setAuthor({
          name: "Modlog",
          iconURL: interaction.guild!.iconURL()!,
        })
        .setDescription(`Select a new modlog channel.`);

      const row1 = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("modlogchoose")
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            guild.channels.cache
              .filter((c) => c.type === "GUILD_TEXT")
              .map((c) => {
                return {
                  label: c.name,
                  value: c.id,
                };
              })
          )
      );

      const row2 = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Back")
          .setCustomId("back")
          .setStyle("DANGER")
      );

      await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
      });
    } else if (interaction.customId === "back") {
      let guild = await this.container.database.guild.findUnique({
        where: { id: interaction.guild!.id },
      });

      if (!guild)
        guild = await this.container.database.guild.create({
          data: { id: interaction.guild!.id },
        });

      const embed = new JoewyEmbed()
        .setAuthor({
          name: `Settings | ${interaction.guild!.name}`,
          iconURL: interaction.guild!.iconURL()!,
        })
        .setDescription(
          `**❯ Modlog:** ${
            guild!.modlog ? `<#${guild!.modlog}>` : `None`
          }\n**❯ Auditlog:** ${
            guild!.auditlog ? `<#${guild!.auditlog}>` : `None`
          }`
        )
        .setTimestamp();

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Edit Modlog")
          .setCustomId("editmod")
          .setStyle("PRIMARY")
          .setEmoji("📝"),
        new MessageButton()
          .setLabel("Edit Auditlog")
          .setCustomId("editaudit")
          .setStyle("PRIMARY")
          .setEmoji("📝")
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    } else if (interaction.customId === "modlogchoose") {
      let guild = await this.container.database.guild.findUnique({
        where: { id: interaction.guild!.id },
      });

      if (!guild)
        guild = await this.container.database.guild.create({
          data: { id: interaction.guild!.id },
        });

      const embed = new JoewyEmbed(true)
        .setAuthor({
          name: "I have set a new channel!",
          iconURL: interaction.guild!.iconURL()!,
        })
        .setDescription(
          // @ts-expect-error cuz im lazy to do types and stuffs
          `You have set the modlog channel to: <#${interaction.values[0]}>`
        );

      await this.container.database.guild.update({
        where: {
          id: guild!.id,
        },
        // @ts-expect-error cuz im lazy to do types and stuffs
        data: { modlog: interaction.values[0] },
      });

      await interaction.reply({ embeds: [embed] });
    } else if (interaction.customId === "editaudit") {
      const guild = await this.container.client.guilds.fetch(
        interaction.guild!.id
      );

      const embed = new JoewyEmbed(true)
        .setAuthor({
          name: "Auditlog",
          iconURL: interaction.guild!.iconURL()!,
        })
        .setDescription(`Select a new auditlog channel.`);

      const row1 = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("auditchoose")
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            guild.channels.cache
              .filter((c) => c.type === "GUILD_TEXT")
              .map((c) => {
                return {
                  label: c.name,
                  value: c.id,
                };
              })
          )
      );

      const row2 = new MessageActionRow().addComponents(
        new MessageButton()
          .setLabel("Back")
          .setCustomId("back")
          .setStyle("DANGER")
      );

      await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
      });
    } else if (interaction.customId === "auditchoose") {
      let guild = await this.container.database.guild.findUnique({
        where: { id: interaction.guild!.id },
      });

      if (!guild)
        guild = await this.container.database.guild.create({
          data: { id: interaction.guild!.id },
        });

      const embed = new JoewyEmbed(true)
        .setAuthor({
          name: "I have set a new channel!",
          iconURL: interaction.guild!.iconURL()!,
        })
        .setDescription(
          // @ts-expect-error cuz im lazy to do types and stuffs
          `You have set the auditlog channel to: <#${interaction.values[0]}>`
        );

      await this.container.database.guild.update({
        where: {
          id: guild!.id,
        },
        // @ts-expect-error cuz im lazy to do types and stuffs
        data: { auditlog: interaction.values[0] },
      });

      await interaction.reply({ embeds: [embed] });
    }
  }
}
