import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  text: { type: String, required: true, maxlength: 20000 }
}, { timestamps: true });

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  // Keep the old field so existing notes are never lost.
  text: { type: String, default: '', maxlength: 20000 },
  entries: { type: [entrySchema], default: [] }
}, { timestamps: true });

schema.index({ user: 1, date: 1 }, { unique: true });
export default mongoose.model('Note', schema);
