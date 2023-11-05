import { Schema, model } from 'mongoose';

const GuildSchema = new Schema({
  guildId: String,
  channelIds: {
    modlogId: String,
    welcomeId: String,
    auditlogId: String,
  },
});

export const Guild = model('Guild', GuildSchema, 'guilds');
