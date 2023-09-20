/* eslint-disable no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

// Get array of all entries
app.get('/api/entries', async (req, res, next) => {
  try {
    const sql = `SELECT *
    from "entries"
    order by "entryId" desc
`;
    const params = [];
    const result = await db.query(sql, params);
    const entries = result.rows;
    res.status(200).json(entries);
  } catch (err) {
    console.error(err);
    next();
  }
});

// Get entry by entryId
app.get('/api/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.entryId);
    if (!Number.isInteger(entryId) || entryId <= 0) {
      throw new ClientError(400, '"entryId" must be an integer');
    }
    const sql = `SELECT *
    from "entries"
    where "entryId" = $1
    `;
    const params = [entryId];
    const result = await db.query(sql, params);
    const entries = result.rows[0];

    if (!entries) {
      throw new ClientError(404, `Cannot find entry with ${entryId}`);
    }
    res.status(200).json(entries);
  } catch (err) {
    console.error(err);
    next();
  }
});

// Create entry
app.post('/api/entries', async (req, res, next) => {
  try {
    const { title, notes, photoUrl } = req.body;
    validateNotes(notes);
    validatePhotoUrl(photoUrl);
    validateTitle(title);

    const sql = `
    insert into "entries" ("title", "notes", "photoUrl")
    values ($1, $2, $3)
    returning *
    `;

    const params = [title, notes, photoUrl];
    const result = await db.query(sql, params);
    const [entries] = result.rows;
    res.status(200).json(entries);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Update an entry

app.put('/api/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.entryId);
    validateEntryId(entryId);
    const { title, notes, photoUrl } = req.body;

    const sql = `UPDATE "entries"
    set "title" = $2,
      "notes" = $3,
      "photoUrl" = $4
    where "entryId" = $1
    returning *`;
    const params = [entryId, title, notes, photoUrl];
    const result = await db.query(sql, params);
    const entries = result.rows[0];
    if (!entries) {
      throw new ClientError(404, `Cannot find entry with ${entryId}`);
    }
    res.status(200).json(entries);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// Delete an entry

app.delete('/api/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.entryId);
    validateEntryId(entryId);
    const sql = `DELETE
      from "entries"
      where "entryId" = $1
      returning *`;
    const params = [entryId];
    const result = await db.query(sql, params);
    const deletedEntry = result.rows[0];
    validateEntryId(entryId, deletedEntry);
    if (!deletedEntry) {
      throw new ClientError(404, `Cannot find entry with ${entryId}`);
    }
    res.status(200).json(deletedEntry);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

app.use(errorMiddleware);
app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});

// validation functions
function validateTitle(title) {
  if (!title) {
    throw new ClientError(400, '"title" is required');
  }
}

function validateEntryId(entryId) {
  if (!Number.isInteger(entryId) || entryId <= 0) {
    throw new ClientError(400, '"entryId" must be a positive integer');
  }
}

function validatePhotoUrl(photoUrl) {
  if (!photoUrl) {
    throw new ClientError(400, '"photoUrl" is required');
  }
}

function validateNotes(notes) {
  if (!notes) {
    throw new ClientError(400, '"notes" is required');
  }
}
