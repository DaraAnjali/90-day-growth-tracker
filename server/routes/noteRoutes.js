import { Router } from 'express';
import auth from '../middleware/auth.js';
import Note from '../models/Note.js';

const r = Router();
r.use(auth);
const validDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d + 'T00:00:00Z')) && new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) === d;
const validText = text => typeof text === 'string' && !!text.trim() && text.length <= 20000;
const output = doc => ({
  date: doc.date,
  entries: doc.entries.length ? doc.entries.map(e => ({ _id: String(e._id), text: e.text })) :
    (doc.text?.trim() ? [{ _id: 'legacy', text: doc.text }] : [])
});
// Convert old single-note records into the new multi-note format on the first edit.
function migrate(doc) {
  if (!doc.entries.length && doc.text?.trim()) {
    doc.entries.push({ text: doc.text });
    doc.text = '';
  }
}
r.get('/', async (req, res, next) => {
  try { res.json((await Note.find({ user: req.user.id })).map(output)); }
  catch (e) { next(e); }
});
r.post('/:date', async (req, res, next) => {
  try {
    if (!validDate(req.params.date) || !validText(req.body.text)) return res.status(400).json({ message: 'Invalid note or date' });
    let doc = await Note.findOne({ user: req.user.id, date: req.params.date });
    if (!doc) doc = new Note({ user: req.user.id, date: req.params.date });
    migrate(doc);
    doc.entries.push({ text: req.body.text.trim() });
    await doc.save();
    res.status(201).json(output(doc));
  } catch (e) { next(e); }
});
r.patch('/:date/:entryId', async (req, res, next) => {
  try {
    if (!validDate(req.params.date) || !validText(req.body.text)) return res.status(400).json({ message: 'Invalid note or date' });
    const doc = await Note.findOne({ user: req.user.id, date: req.params.date });
    if (!doc) return res.status(404).json({ message: 'Note not found' });
    if (req.params.entryId === 'legacy' && !doc.entries.length) {
      doc.text = req.body.text.trim();
    } else {
      const entry = doc.entries.id(req.params.entryId);
      if (!entry) return res.status(404).json({ message: 'Note not found' });
      entry.text = req.body.text.trim();
    }
    await doc.save(); res.json(output(doc));
  } catch (e) { next(e); }
});
r.delete('/:date/:entryId', async (req, res, next) => {
  try {
    if (!validDate(req.params.date)) return res.status(400).json({ message: 'Invalid date' });
    const doc = await Note.findOne({ user: req.user.id, date: req.params.date });
    if (!doc) return res.status(404).json({ message: 'Note not found' });
    if (req.params.entryId === 'legacy' && !doc.entries.length) doc.text = '';
    else {
      const entry = doc.entries.id(req.params.entryId);
      if (!entry) return res.status(404).json({ message: 'Note not found' });
      doc.entries.pull(entry._id);
    }
    if (!doc.entries.length && !doc.text.trim()) await doc.deleteOne();
    else await doc.save();
    res.json({ date: req.params.date, entries: doc.entries.length || doc.text.trim() ? output(doc).entries : [] });
  } catch (e) { next(e); }
});
export default r;
