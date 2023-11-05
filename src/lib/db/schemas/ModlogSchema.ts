import { Schema, model } from 'mongoose';

const ModlogSchema = new Schema({
  guildId: String,
  userId: String,
  moderatorId: String,
  reason: String,
  evidence: String,
  type: Number,
});

export const Modlog = model('Modlog', ModlogSchema, 'modlogs');
