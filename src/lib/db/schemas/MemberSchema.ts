import { Schema, model } from 'mongoose';

const MemberSchema = new Schema({
  userId: String,
  guildId: String,
});

export const Member = model('Member', MemberSchema, 'members');
