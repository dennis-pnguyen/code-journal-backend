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
    from "entries"`;
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

app.use(errorMiddleware);
app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
