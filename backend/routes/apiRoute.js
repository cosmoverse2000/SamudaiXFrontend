import express from 'express';
const router = express.Router();
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import { google } from 'googleapis'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'http://localhost:8080'
)

router.get('/', async (req, res, next) => {

  res.send({ message: 'Ok api is working 🚀' });
});

const REFRESH_TOKEN = process.env.REFRESH_TOKEN

router.post('/create-tokens', async (req, res, next) => {
  try {

    const { code } = req.body
    const { tokens } = await oauth2Client.getToken(code);
    res.send(tokens);
  } catch (error) {
    next(error)
  }
})

router.post('/get-events', async (req, res, next) => {
  try {
    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })
    const { start, end } = req.body
    const calendar = google.calendar('v3')
    const response = await calendar.events.list({
      auth: oauth2Client,
      calendarId: 'primary',
      timeMin: start,
      maxResults: 10,
      // timeMax: end,
      singleEvents: true,
      orderBy: 'startTime',
      timeZone: 'Asia/Kolkata'
    });
    res.send(response)
  } catch (error) {
    next(error)
  }
})

export { router }
