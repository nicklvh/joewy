import { Schema, model } from 'mongoose';

const MemberSchema = new Schema({
  userId: String,
  guildId: String,
});

export const MemberModel = model('member', MemberSchema);
