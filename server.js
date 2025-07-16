import { fileURLToPath } from "url";
import page_builder from "./public/document.js";
import session from 'express-session';
import express from "express";
import path from "path";
import 'dotenv/config';

import { gatherCombined, getCombined } from './functions/cloudflare.js';
import { checkExpiry } from './functions/key.js';

import mail from './APIs/mail.js';
import key from './APIs/key.js';

const PORT = process.env.PORT || 1025;
const DEBUG = process.env.DEBUG === 'true' || false;

const standardMasterkey = process.env.STANDARDMASTERKEY;
const keyExpiryDays = parseInt(process.env.KEYEXPIRYDAYS);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Express session
app.use(session({
    secret: process.env.EXPRESSSESSION,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: keyExpiryDays * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Static files and cashing
const videoMimeTypes = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.flv': 'video/x-flv',
  '.wmv': 'video/x-ms-wmv'
};

app.use('/routing', express.static(path.join(__dirname, 'public/front-end/routing'), {
    maxAge: 31536000,
    setHeaders: function (res, path) {
        res.set('Cache-Control', 'public, max-age=31536000, must-revalidate');
    }
}));

app.use('/media', express.static(path.join(__dirname, 'public/front-end/dependants/media'), {
    maxAge: 31536000,
    setHeaders: function (res, filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if (videoMimeTypes[ext]) res.setHeader('Content-Type', videoMimeTypes[ext]);
    }
})); 

app.use('/models', express.static(path.join(__dirname, 'public/front-end/dependants/models'), {
    maxAge: 31536000
}));

app.use('/fonts', express.static(path.join(__dirname, 'public/front-end/dependants/fonts'), {
    maxAge: 31536000
}));

// Crawling
app.use('/robots.txt', express.static(path.join(__dirname, 'public/front-end/robots.txt')));
app.use('/sitemap.xml', express.static(path.join(__dirname, 'public/front-end/sitemap.xml')));

app.get('/robots.txt', async (req, res) => {
    res.send('/robots.txt');
});

app.get('/sitemap.xml', async (req, res) => {
    res.send('/sitemap.xml');
});

// APIs
app.use('/mail', mail);
app.use('/key', key);

// Routing
async function setings_builder(req, location) {
    if (!location) return;
    const location_parts = location.split('/');

    let settings = {
        location: location_parts.slice(2).join('/'),
        locale: location_parts[1],
        extra: {}
    };

    if (location_parts.length <= 2) {
        settings.location = settings.locale || "index";
        settings.locale = "main";
    };

    if (DEBUG) console.log('location:', settings.location);
    if (DEBUG) console.log('locale:', settings.locale);

    // Return extra content to the front
    if (settings.locale == 'main' && settings.location == 'index') {
        const { visitors, requests } = await getCombined();
        if (visitors) settings.extra.visitors = visitors;
        if (requests) settings.extra.requests = requests;
    };

    // Resolve to key/input if user is not authenticated
    if (!req.session.user) {
        settings.locale = 'key';
        settings.location = 'index';
    } else {
        const user = req.session.user;
        const type = user?.type;
        const key = user?.key;

        if (type == 2) {
            settings.locale = 'key';
            settings.location = 'master';
        }

        else if (key !== standardMasterkey) {
            const expired = await checkExpiry(key);

            if (expired) {
                settings.locale = 'key';
                settings.location = 'index';
            }
        }
    };

    return settings;
};

app.get(['/', '/*splat'], async (req, res, next) => {
    const location = req.path;
    const static_location = /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map)(\?.*)?$/.test(location);
    if (static_location) return next();

    const settings = await setings_builder(req, location);
    const document = await page_builder(settings);

    if (document == 'NOTFOUND') {
        const settings = {
            location: 'not-found',
            locale: 'main'
        }

        return res.status(404).send(await page_builder(settings));
    };

    res.send(document);
});

(async () => {
    // Initialize cloudflare requests and visitors
    await gatherCombined();
    setInterval(gatherCombined, 1 * 60 * 60 * 1000);

    app.listen(PORT, () => {
        console.log('App is listening on port:', parseInt(PORT));
    });
})();