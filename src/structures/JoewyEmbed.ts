import { MessageEmbed } from "discord.js";

export class JoewyEmbed extends MessageEmbed {
  public constructor(timestamp?: boolean) {
    super();
    this.setColor("WHITE");

    if (timestamp !== false) {
      this.setTimestamp();
    }
  }
}
