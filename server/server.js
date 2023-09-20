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

app.use(errorMiddleware);
app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
