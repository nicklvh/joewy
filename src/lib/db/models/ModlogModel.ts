import { Schema, model } from 'mongoose';

const ModlogSchema = new Schema({
  userId: String,
  guildId: String,
  action: 'ban' || 'mute' || 'kick' || 'warn',
  evidence: String,
});

export const ModlogModel = model('member', ModlogSchema);
