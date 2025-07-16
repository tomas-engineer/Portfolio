import * as crypto from "node:crypto";
import { fileURLToPath } from 'url';
import path from 'path';
import 'dotenv/config'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const keysPath = path.join(__dirname, '../storage/keys.json');

const masterKey = process.env.MASTERKEY;
const keyExpiryDays = parseInt(process.env.KEYEXPIRYDAYS);

import { readFile, writeFile } from './file.js';

async function validateKey(key, ip) {
    const keys = JSON.parse(await readFile(keysPath));
    const foundKey = keys?.[key];

    if (key == masterKey) return { success: true, user: 2 };
    else if (!foundKey) return { success: false, message: 'Toegangssleutel niet gevonden' };

    else if (foundKey) {
        const now = new Date();
        const expiresAt = new Date(foundKey.expires);

        if (now > expiresAt) {
            delete keys[key];
            writeFile(keysPath, JSON.stringify(keys, null, 4));

            return { success: false, message: 'Toegangssleutel is verlopen' };
        }

        if (foundKey.used && foundKey.ip !== ip) {
            return { success: false, message: 'Toegangssleutel is al in gebruik' };
        }

        keys[key].used = true;
        keys[key].ip = ip;

        writeFile(keysPath, JSON.stringify(keys, null, 4));

        return { success: true, user: 1 };
    } else if (foundKey >= 1) {
        return { success: false, message: 'Toegangssleutel is al in gebruik' };
    }
}

async function generateKeys(amount) {
    const keys = JSON.parse(await readFile(keysPath));
    let newKeys = [];

    for (let i = 0; i < amount; i++) {
        let key = '';

        for (let v = 0; v < 3; v++) {
            const batch = crypto.randomBytes(5).toString('hex');
            key += batch
            if (v < 2) key += '-';
        }

        newKeys.push(key);

        // Activate the keys
        const expiresAt = new Date(Date.now() + keyExpiryDays * 24 * 60 * 60 * 1000).toISOString();
        keys[key] = { used: false, expires: expiresAt };

    }

    writeFile(keysPath, JSON.stringify(keys, null, 4));
    return { success: true, keys: newKeys };
}

async function checkExpiry(target) {
    const keys = JSON.parse(await readFile(keysPath));
    const key = keys?.[target];
    if (!key) return true;

    const now = new Date();
    const expiresAt = new Date(key.expires);

    if (now > expiresAt) {
        delete keys[target];
        writeFile(keysPath, JSON.stringify(keys, null, 4));
        return true;
    } else return false;
}

async function getKeys() {
    const keys = JSON.parse(await readFile(keysPath));
    const array = Object.entries(keys).map(([key, data]) => ({ key, used: data.used, expires: data.expires }));
    return array;
}

async function removeKey(key) {
    const keys = JSON.parse(await readFile(keysPath));
    
    if (keys[key]) {
        delete keys[key];
        writeFile(keysPath, JSON.stringify(keys, null, 4));
        return { success: true };
    } else return { success: false, message: 'Key not found' };
}

export { validateKey, generateKeys, checkExpiry, getKeys, removeKey }