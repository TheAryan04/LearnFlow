import { db } from '../config/database.js';

export const PROJECTION = { projection: { _id: 0, _order: 0 } };

export const find = (collection, query = {}) =>
  db.collection(collection).find(query, PROJECTION).sort({ _order: -1 }).toArray();

export const findOne = (collection, query) =>
  db.collection(collection).findOne(query, PROJECTION);

export async function insert(collection, item) {
  await db.collection(collection).insertOne({ ...item, _order: Date.now() / 1000 });
  return item;
}

export async function update(collection, id, changes) {
  await db.collection(collection).updateOne({ id }, { $set: changes });
  return findOne(collection, { id });
}
