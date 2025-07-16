import fs from 'fs';

async function readFile(path) {
    return fs.readFileSync(path, 'utf-8');
}

async function writeFile(path, file) {
    fs.writeFileSync(path, file);
}

export { readFile, writeFile }