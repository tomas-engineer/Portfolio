import express from 'express';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

const router = express.Router();
router.use(express.json())

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});

import { validateKey, generateKeys, getKeys, removeKey } from '../functions/key.js';
const standardMasterkey = process.env.STANDARDMASTERKEY;

router.post('/validate', limiter, async (req, res) => {
    const { key } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!key) return res.status(400).send({ success: false, message: 'Insignificant parameters' });

    const { success, user, message } = await validateKey(key, ip);
    if (!success) return res.status(400).send({ success: false, message });
    if (user) req.session.user = { type: user, key };
    
    if (req.session.user) res.status(200).send({ success: true });
    else res.status(500).send({ success: false, message: 'Something went wrong' })
});

router.post('/generate', async (req, res) => {
    const { amount } = req.body;
    if (!amount) return res.status(400).send({ success: false, message: 'Insignificant parameters' });

    const { success, keys, message } = await generateKeys(amount);
    if (!success) return res.status(400).send({ success: false, message });

    if (keys) res.status(200).send({ success: true, keys });
    else res.status(500).send({ success: false, message: 'Something went wrong' })
});

router.post('/swap', async (req, res) => {
    const type = req.session?.user?.type;
    if (!type || type !== 2) return res.status(400).send({ success: false, message: 'Action unauthorized' });

    req.session.user = { type: 1, key: standardMasterkey };
    res.status(200).send({ success: true });
});

router.post('/logout', async (req, res) => {
    const user = req.session?.user;
    if (!user) return res.status(400).send({ success: false, message: 'Already logged out' });

    delete req.session.user;
    res.status(200).send({ success: true });
});

router.post('/retrieve', async (req, res) => {
    const type = req.session?.user?.type;
    if (!type || type !== 2) return res.status(400).send({ success: false, message: 'Action unauthorized' });

    const keys = await getKeys();
    res.status(200).send({ success: true, keys});
});

router.post('/delete', async (req, res) => {
    const type = req.session?.user?.type;
    const { key } = req.body;

    if (!type || type !== 2) return res.status(400).send({ success: false, message: 'Action unauthorized' });
    if (!key) return res.status(400).send({ success: false, message: 'Insignificant parameters' });

    const { success, message } = await removeKey(key);
    if (!success) return res.status(400).send({ success: false, message });

    res.status(200).send({ success: true});
});

export default router;