import { Schema, model } from 'mongoose';

const GuildSchema = new Schema({
  guildId: String,
  channelIds: {
    modlogId: String,
    welcomeId: String,
    auditlogId: String,
  },
  roleIds: {
    modRoleId: String,
  },
  options: {
    modlog: Boolean,
    welcome: Boolean,
    auditlog: Boolean,
  },
});

export const GuildModel = model('guilds', GuildSchema);
