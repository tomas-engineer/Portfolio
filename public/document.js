import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import 'dotenv/config';

const DEBUG = process.env.DEBUG === 'true' || false;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// FUNCTIONS
function gatherFiles(path, extension) {
    const files = fs.readdirSync(path);
    let entries = [];

    files.forEach(file => {
        if (!file.endsWith(extension) && !(file.endsWith('.scss') && extension == '.css')) return;
        const content = fs.readFileSync(path + `/${file}`, 'utf8');
        if (content) entries.push({ file, content })
    });

    return entries;
}

// DOCUMENT FUNCTIONS
async function head(location, locale, extra = {}) {
    let formattedLocation = location.charAt(0).toUpperCase() + location.substring(1);
    if (formattedLocation.includes('-')) formattedLocation = formattedLocation.split('-').join(' ');

    var title = "Portfolio: " + formattedLocation;
    var description = 'Full Stack Developer met drie jaar ervaring in het bouwen van snelle, stabiele en gebruiksvriendelijke websites. Gericht op detail, probleemoplossend vermogen en een intuïtieve gebruikerservaring.';
    var keywords = 'webontwikkelaar, websites bouwen, frontend developer, backend developer, fullstack developer, web design, web developer, website ontwerp';
    var canonical = 'http://localhost:1029/' + location;

    if (locale != 'main') canonical = 'http://localhost:1029/' + locale + '/' + location;

    if (locale == 'main') {
        switch (location) {
            case 'index':
                title = 'Maak kennis met mij';
                description = 'Een ervaren webontwikkelaar met 3 jaar praktijkervaring. Ik bouw snelle en stabiele websites met focus op gebruiksvriendelijkheid en intuïtief design.';
                keywords = 'webontwikkelaar, websites bouwen, frontend developer, backend developer, fullstack developer, web design, web developer, website ontwerp';
                canonical = 'http://localhost:1029/';
                break;
            case 'not-found':
                title = 'Pagina niet gevonden';
                break;
        }
    }

    const tags = [];
    
    Object.keys(extra).forEach(pointer => {
        const content = extra[pointer];
        if (content) tags.push(`<meta name="${pointer}" content="${content}" />`);
    });

    return await `
            <head>
            ${tags.join('\n')}
            
            <link rel="preload" href="/fonts/Montserrat-Light.ttf" as="font" type="font/ttf" crossorigin="anonymous">
            <link rel="preload" href="/fonts/Montserrat-Regular.ttf" as="font" type="font/ttf" crossorigin="anonymous">
            <link rel="preload" href="/fonts/Montserrat-SemiBold.ttf" as="font" type="font/ttf" crossorigin="anonymous">
            <link rel="preload" href="/fonts/Montserrat-Bold.ttf" as="font" type="font/ttf" crossorigin="anonymous">

            <meta charset="UTF-8">
            <meta name="description" content="${await description}">
            <meta name="keywords" content="${await keywords}">
            <meta name="author" content="contact@tomasheij.nl">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name=\"robots\" content=\"noindex\">
            
            <title>${await title}</title>
            <link rel="canonical" href="${await canonical}">

            <link rel="icon" href="/media/images/logo/main.ico">
            <link rel="apple-touch-icon" type="image/png" href="/media/images/logo/main.png">
            <link rel="apple-touch-startup-image" type="image/png" href="/media/images/logo/main.png">

            <meta property="og:title" content="${await title}">
            <meta property="og:description" content="${await description}">
            <meta property="og:image" content="/media/images/logo/main.webp">
            <meta property="og:type" content="website">
            <meta property="og:url" content="http://localhost:1029/">
            </head>
        `;
}

async function css(location, locale) {
    const localePath = path.join(__dirname, `front-end/routing/${locale}`);
    const locationPath = path.join(__dirname, `front-end/routing/${locale}/${location}`);

    let style = await gatherFiles(localePath, '.css') || '';
    const extraStyle = await gatherFiles(locationPath, '.css');

    style = [...style, ...extraStyle];
    style = style.map(selector => selector.content).join('\n\n');

    return `<style>${style}</style>`;
}

async function header(location, locale) {
    try {
        return fs.readFileSync(path.join(__dirname, `front-end/routing/${locale}/header.html`), 'utf8')
    } catch (error) { };
}

async function loader(location, locale) {
    return fs.readFileSync(path.join(__dirname, `front-end/routing/${locale}/loader.html`), 'utf8');
}

async function body(location, locale) {
    return fs.readFileSync(path.join(__dirname, `front-end/routing/${locale}/${location}/index.html`), 'utf8');
}

async function footer(location, locale) {
    try {
        return fs.readFileSync(path.join(__dirname, `front-end/routing/${locale}/footer.html`), 'utf8')
    } catch (error) { };
}

async function script(location, locale) {
    const localePath = path.join(__dirname, `front-end/routing/${locale}`);
    const locationPath = path.join(__dirname, `front-end/routing/${locale}/${location}`);

    let script = await gatherFiles(localePath, '.js') || '';
    const extraScript = await gatherFiles(locationPath, '.js');

    script = [...script, ...extraScript];

    let module = '';
    let regular = '';

    script.forEach(({ file, content }, index) => {
        const new_line = (index < script.length - 1) ? '\r\n' : '';

        if (file.toLowerCase().includes('3d')) module += content + new_line;
        else regular += content + new_line;
    });

    script = `<script>${regular.trim()}</script>`;
    if (module) script += `${script.length > 0 ? '\r\n' : ''}<script type="module">${module.trim()}</script>`;

    return script;
}

// EXPORT DOCUMENT
export default async function ({ location, locale, extra }) {
    if (DEBUG) console.log('\r\nDocument builder called');

    if (!fs.existsSync(path.join(__dirname, `front-end/routing/${locale}/${location}/index.html`))) {
        if (DEBUG) console.log(`${location} in ${locale} could not be found`);
        return "NOTFOUND";
    };

    if (DEBUG) console.log(`Getting the head for ${location} in ${locale}`);
    let _head = await head(location, locale, extra) || '';
    
    if (DEBUG) console.log(`Getting the css('s) for ${location} in ${locale}`);
    let _css = await css(location, locale) || '';
    
    if (DEBUG) console.log(`Getting the header for ${location} in ${locale}`);
    let _header = await header(location, locale) || '';
    
    if (DEBUG) console.log(`Getting the loader for ${location} in ${locale}`);
    let _loader = await loader(location, locale) || '';

    if (DEBUG) console.log(`Getting the body for ${location} in ${locale}`);
    let _body = await body(location, locale) || '';
    
    if (DEBUG) console.log(`Getting the footer for ${location} in ${locale}`);
    let _footer = await footer(location, locale) || '';
    
    if (DEBUG) console.log(`Getting the script(s) for ${location} in ${locale}`);
    let _script = await script(location, locale) || '';

    try {
        let match = _header.match(/<extra-start>([\s\S]*?)<\/([\w-]+)>/)
        if (match) {
            const [full, content] = match;
            _header = _header.replace(full, '').trim();

            content.split('\n').forEach(line => {
                if (!_head.includes(line.trim())) {
                    _head = line + _head + '\n';
                }
            })
        }
    } catch (error) { }

    try {
        let match = _header.match(/<extra-end>([\s\S]*?)<\/([\w-]+)>/);
        if (match) {
            const [full, content] = match;
            _header = _header.replace(full, '').trim();

            content.split('\n').forEach(line => {
                if (!_head.includes(line.trim())) {
                    _head += line + '\n';
                }
            })
        }
    } catch (error) { }

    try {
        const match = _body.match(/<extra-start>([\s\S]*?)<\/([\w-]+)>/);
        if (match) {
            const [full, content] = match;
            _body = _body.replace(full, '').trim();

            content.split('\n').forEach(line => {
                if (!_head.includes(line.trim())) {
                    _head = line + _head + '\n';
                }
            })
        }
    } catch (error) { }

    try {
        const match = _body.match(/<extra-end>([\s\S]*?)<\/([\w-]+)>/);
        if (match) {
            const [full, content] = match;
            _body = _body.replace(full, '').trim();
            content.split('\n').forEach(line => {
                if (!_head.includes(line.trim())) {
                    _head += line + '\n';
                }
            })
        }
    } catch (error) { }

    let snippet = `body > * { opacity: 0; }`;

    if (_css && _css.includes('<style>')) {
        _css = _css.replace(
            /<style>/i,
            `<style>\n${snippet}\n`
        );
    } else {
        _css = `<style>${snippet}</style>`;
    }

    snippet = `
    let loaderTimeout;
    Promise.all([
        document.fonts.ready,
        new Promise(resolve => window.onload = resolve)
    ]).then(() => {
        clearTimeout(loaderTimeout);
        const children = Array.from(document.body.children);
        children.forEach(child => {
            if (child.id === "body-loader") {
                child.style.opacity = '0';
            } else {
                child.style.opacity = '1';
            }
        });
    });

    loaderTimeout = setTimeout(() => {
        const loader = document.getElementById("body-loader");
        if (loader) loader.style.opacity = '1';
    }, 1000);
    `;
    
    if (_script && _script.includes('</script>')) {
        _script = _script.replace(
            /<\/script>/i,
            `${snippet}\n</script>`
        );
    } else {
        _script = `<script>${snippet}</script>`;
    }

    return `
    <!DOCTYPE html>
    <html lang="en">
    ${_head}
    ${_css}
    <body>${_header}
    ${_loader}
    ${_body}
    ${_footer}</body>
    ${_script}
    </html>
    `;
}