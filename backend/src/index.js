import cors from 'cors';
import express from 'express';
import Session from 'express-session';
import { generateNonce, SiweMessage } from 'siwe';
import createError from 'http-errors';//
import morgan from 'morgan';//
import dotenv from "dotenv";//

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true,
}))

app.use(Session({
    name: 'siwe-quickstart',
    secret: "siwe-quickstart-secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true }
}));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.get('/nonce', async function (req, res) {
    req.session.nonce = generateNonce();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(req.session.nonce);
});

app.post('/verify', async function (req, res) {
    try {
        if (!req.body.message) {
            res.status(422).json({ message: 'Expected prepareMessage object as body.' });
            return;
        }

        let message = new SiweMessage(req.body.message);
        const fields = await message.validate(req.body.signature);
        if (fields.nonce !== req.session.nonce) {
            // console.log(req.session);
            res.status(422).json({
                message: `Invalid nonce.`,
            });
            return;
        }
        req.session.siwe = fields;
        req.session.cookie.expires = new Date(fields.expirationTime);
        req.session.save(() => res.status(200).end());
    } catch (e) {
        req.session.siwe = null;
        req.session.nonce = null;
        console.error(e);
        switch (e) {
            case ErrorTypes.EXPIRED_MESSAGE: {
                req.session.save(() => res.status(440).json({ message: e.message }));
                break;
            }
            case ErrorTypes.INVALID_SIGNATURE: {
                req.session.save(() => res.status(422).json({ message: e.message }));
                break;
            }
            default: {
                req.session.save(() => res.status(500).json({ message: e.message }));
                break;
            }
        }
    }
});

app.get('/personal_information', function (req, res) {
    if (!req.session.siwe) {
        res.status(401).json({ message: 'You have to first sign_in' });
        return;
    }
    console.log("User is authenticated!");
    res.setHeader('Content-Type', 'text/plain');
    res.send(`You are authenticated and your address is: ${req.session.siwe.address}`)
});


app.get('/', async (req, res, next) => {
    res.send({ message: 'Awesome it works 🐻' });
});

import { router as apiRoute } from '../routes/apiRoute.js';
app.use('/api', apiRoute);


app.use((req, res, next) => {
    next(createError.NotFound());
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        status: err.status || 500,
        message: err.message,
    });
});


app.listen(3000);