import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();
router.use(express.json())

import { sendMail } from '../functions/mail.js';

const limiter = rateLimit({
    windowMs: 1 * 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});

router.post('/send', limiter, async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).send({ success: false, message: 'Insignificant parameters' });
    }

    const response = await sendMail(name, email, message);
    const { success, message: r_message } = response;

    res.status(200).send({ success, message: r_message });
});

export default router;