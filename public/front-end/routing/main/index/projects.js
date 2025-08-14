const bodyElement = document.querySelector('body');

const projectEnlargeOuterElement = document.getElementById('project-enlarge-outer');
const projectEnlargeElement = document.getElementById('project-enlarge');

const projectEnlargeHeaderElement = document.getElementById('project-enlarge-header');
const projectEnlargeVideoOuterElement = document.getElementById('project-enlarge-video-outer');
const projectEnlargeLoaderOuterElement = document.getElementById('project-enlarge-loader-outer');
const projectEnlargeTitleElement = document.getElementById('project-enlarge-title');
const projectEnlargeDateElement = document.getElementById('project-enlarge-date');
const projectEnlargeBodyElement = document.getElementById('project-enlarge-body');
const projectEnlargeStacksElement = document.getElementById('project-enlarge-stacks');
const projectEnlargeDescriptionElement = document.getElementById('project-enlarge-description');
const projectEnlargeButtonsElement = document.getElementById('project-enlarge-buttons');

const loadedVideos = new Map();
const loadedProjects = new Map();

var enlargedProject = null;

function isFullscreen(element) {
    return (document.fullscreenElement === element || document.webkitFullscreenElement === element || document.mozFullScreenElement === element || document.msFullscreenElement === element);
};

function toggleControls(element) {
    if (!element || isFullscreen(element)) return;
    const playing = !element.paused && !element.ended && element.readyState > 2;

    element.controls = !element.controls;
    const active = !!element.controls;

    if (playing) setTimeout(() => element.play(), 1);

    if (active) element.style.cursor = 'unset';
    else element.style.cursor = 'pointer';
};

function matchEnlargedVideo() {
    const projectEnlargeVideoElement = projectEnlargeVideoOuterElement?.querySelector('#project-enlarge-video');
    if (!projectEnlargeVideoElement) return;

    const height = parseInt(window.getComputedStyle(projectEnlargeVideoElement)?.height?.split('px')[0]);
    const maxHeight = parseInt(window.getComputedStyle(projectEnlargeVideoOuterElement)?.maxHeight?.split('px')[0]);

    if (height >= maxHeight) {
        const width = window.getComputedStyle(projectEnlargeVideoElement).width;
        projectEnlargeElement.style.maxWidth = width;
    }
};

class project {
    constructor({ name, title, destination, summary, description, date, extension = '.mp4', stacks, buttons }) {
        this.name = name;
        this.title = title;
        this.destination = destination;
        this.summary = summary;
        this.description = description;
        this.date = date;
        this.extension = extension
        this.stacks = stacks;
        this.buttons = buttons;
    };

    add(parent = 'projects') {
        const parentElement = document.getElementById(parent);

        const project = document.createElement('div');
        project.className = 'project row';

        const left = document.createElement('div');
        left.className = 'left';

        const imgHolder = document.createElement('div');
        imgHolder.classList = 'project-images';

        const desktopImg = document.createElement('img');
        desktopImg.classList = 'project-image-desktop';
        desktopImg.loading = "lazy";
        desktopImg.src = this.destination + '/desktop-screenshot.webp';

        const phoneImg = document.createElement('img');
        phoneImg.classList = 'project-image-phone';
        phoneImg.loading = "lazy";
        phoneImg.src = this.destination + '/mobile-screenshot.webp';

        imgHolder.appendChild(desktopImg);
        imgHolder.appendChild(phoneImg);
        left.appendChild(imgHolder);

        const right = document.createElement('div');
        right.className = 'right';

        const info = document.createElement('div');

        const title = document.createElement('h3');
        title.className = 'project-title';
        title.textContent = this.title;

        info.appendChild(title);
        if (this.summary) {
            const summary = document.createElement('p');
            summary.className = 'project-summary';
            summary.textContent = this.summary
            info.appendChild(summary);
        }

        if (this.stacks.length > 0) {
            var stacks = document.createElement('div');
            stacks.className = 'project-stacks';

            this.stacks.forEach(({ title, image }) => {
                if (title.toLowerCase() == 'html' || title.toLowerCase() == 'css' || title.toLowerCase() == 'javascript') return;

                const stack = document.createElement('div');
                stack.className = 'project-stack img-text';

                const stackImg = document.createElement('img');
                stackImg.loading = "lazy";
                stackImg.src = image;

                const span = document.createElement('span');
                span.textContent = title;

                stack.appendChild(stackImg);
                stack.appendChild(span);
                stacks.appendChild(stack);
            });
        }

        if (this.buttons.length > 0) {
            var buttonRow = document.createElement('div');
            buttonRow.className = 'button-row';

            this.buttons.forEach(({ type, text, image, size = '19px', action }) => {
                const button = document.createElement('div');
                button.className = `${type}-button${image ? ' img-text' : ''}`;
                button.innerHTML = `${image ? `<img src="${image}" width="${size}" height="${size}">\r\n` : ''}<span>${text}</span>`;
                if (action) button.addEventListener('click', action);

                buttonRow.appendChild(button);
            });
        }

        right.appendChild(info);
        if (stacks) right.appendChild(stacks);
        if (buttonRow) right.appendChild(buttonRow);

        project.appendChild(left);
        project.appendChild(right);

        parentElement.appendChild(project);
    };

    enlarge() {
        enlargedProject = this;

        const scrollbarWidth = getScrollbarWidth();
        bodyElement.style.paddingRight = scrollbarWidth + 'px';
        if (backToTop) backToTop.style.marginRight = scrollbarWidth + 'px';

        projectEnlargeOuterElement.style.display = 'flex';
        projectEnlargeOuterElement.style.opacity = '0';
        projectEnlargeOuterElement.offsetWidth;

        projectEnlargeOuterElement.style.opacity = '1';

        projectEnlargeElement.style.transform = `translateX(calc(-1 * (100% + (var(--padding) * 2))))`;
        projectEnlargeElement.offsetWidth;

        const { video, loader } = loadedVideos.get(this.name);

        if (!projectEnlargeVideoOuterElement.contains(video)) {
            projectEnlargeVideoOuterElement.appendChild(video);
        }
        if (!projectEnlargeLoaderOuterElement.contains(loader)) {
            projectEnlargeLoaderOuterElement.appendChild(loader);
        }

        if (video.readyState < 4) {
            loader.style.display = 'block';
            video.style.display = 'none';

            video.addEventListener('canplaythrough', function onReady() {
                loader.style.display = 'none';
                video.style.display = 'block';
                video.play();
                video.removeEventListener('canplaythrough', onReady);
            });
        } else {
            loader.style.display = 'none';
            video.style.display = 'block';
            video.play();
        }

        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;


        projectEnlargeTitleElement.textContent = this.title;
        projectEnlargeDateElement.textContent = this.date;

        if (this.stacks.length > 0) {
            var stacks = document.createElement('div');
            stacks.className = 'project-stacks';

            this.stacks.forEach(({ title, image }) => {
                const stack = document.createElement('div');
                stack.className = 'project-stack img-text';

                const stackImg = document.createElement('img');
                stackImg.loading = "lazy";
                stackImg.src = image;

                const span = document.createElement('span');
                span.textContent = title;

                stack.appendChild(stackImg);
                stack.appendChild(span);
                projectEnlargeStacksElement.appendChild(stack);
            });
        };

        projectEnlargeDescriptionElement.textContent = this.description;

        if (this.buttons.length > 0) {
            var buttonRow = document.createElement('div');
            buttonRow.className = 'button-row';

            this.buttons.forEach(({ type, text, image, size = '19px', action }) => {
                if (text.trim().toLowerCase() == 'meer info') {
                    image = '/media/images/icons/uncategorized/close.webp';
                    action = this.close;
                    text = 'Verberg';
                    size = '17px';
                };

                const button = document.createElement('div');
                button.className = `${type}-button${image ? ' img-text' : ''}`;
                button.innerHTML = `${image ? `<img src="${image}" width="${size}" height="${size}">\r\n` : ''}<span>${text}</span>`;
                if (action) button.addEventListener('click', action);

                projectEnlargeButtonsElement.appendChild(button);
            });
        };

        bodyElement.style.overflow = 'hidden';
        projectEnlargeElement.style.transform = `translateX(0)`;
    };

    close() {
        enlargedProject = null;
        projectEnlargeElement.style.transform = `translateX(calc(-1 * (100% + (var(--padding) * 2))))`;
        projectEnlargeOuterElement.style.opacity = '0';

        let transformDone = false;
        let opacityDone = false;

        const checkDone = () => {
            if (transformDone && opacityDone) {
                bodyElement.style.paddingRight = '0';
                if (backToTop) backToTop.style.marginRight = '0';

                projectEnlargeOuterElement.style.display = 'none';

                projectEnlargeVideoOuterElement.innerHTML = '';
                projectEnlargeLoaderOuterElement.innerHTML = '';
                projectEnlargeTitleElement.textContent = '';
                projectEnlargeDateElement.textContent = '';
                projectEnlargeStacksElement.innerHTML = '';
                projectEnlargeDescriptionElement.textContent = '';
                projectEnlargeButtonsElement.innerHTML = '';

                bodyElement.style.overflow = 'auto';

                projectEnlargeElement.removeEventListener('transitionend', onTransformEnd);
                projectEnlargeOuterElement.removeEventListener('transitionend', onOpacityEnd);
            }
        };

        const onTransformEnd = (event) => {
            if (event.propertyName === 'transform') {
                transformDone = true;
                checkDone();
            }
        };

        const onOpacityEnd = (event) => {
            if (event.propertyName === 'opacity') {
                opacityDone = true;
                checkDone();
            }
        };

        projectEnlargeElement.addEventListener('transitionend', onTransformEnd);
        projectEnlargeOuterElement.addEventListener('transitionend', onOpacityEnd);
    }
};

function loadVideos(projects = loadedProjects) {
    projects.forEach(project => {
        const video = document.createElement('video');
        video.src = project.destination + '/showcase.mp4';
        video.id = 'project-enlarge-video';
        video.preload = 'metadata';
        video.muted = true;
        video.style.display = 'none';
        video.playsInline = true;

        const loader = document.createElement('img');
        loader.src = '/media/projects/loader.gif';
        loader.id = 'project-enlarge-loader';
        loader.style.zIndex = '10';
        loader.style.display = 'none';


        loadedVideos.set(project.name, { video, loader });
    });
};

function loadProjects() {
    const rologin = new project({
        name: 'rologin',
        title: 'Bulk Roblox Login Tool',
        destination: '/media/projects/rologin',
        summary: 'Rologin is een bulk login tool voor Roblox waarmee je tegelijk in meerdere accounts kunt inloggen en biedt een ingebouwde account manager om je accounts te beheren.',
        description: 'Rologin is een efficiënte tool waarmee je tegelijkertijd in meerdere Roblox accounts kunt inloggen. Het biedt een overzichtelijke accountmanager om al je accounts eenvoudig te beheren en snel tussen ze te wisselen. Daarnaast kun je Rologin volledig aanpassen met een eigen thema, zodat het precies bij jouw stijl past. Rologin werkt met een Chrome-extensie die het inloggen en beheren van accounts verzorgt, terwijl een website dient als interface om de extensie aan te sturen.',
        date: '13 februari 2025',
        stacks: [
            { title: 'HTML', image: '/media/images/icons/languages/front-end/html.webp' },
            { title: 'CSS', image: '/media/images/icons/languages/front-end/css.webp' },
            { title: 'JavaScript', image: '/media/images/icons/languages/front-end/js.webp' },
            { title: 'Node.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'Express.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'Chrome Extensions', image: '/media/images/icons/tools/chromeextensions.webp' },
            { title: 'Docker', image: '/media/images/icons/tools/docker.webp' },
            { title: 'NGINX', image: '/media/images/icons/tools/nginx.webp' },
            { title: 'Cloudflare', image: '/media/images/icons/tools/cloudflare.webp' },
            { title: 'npm', image: '/media/images/icons/tools/npm.webp' }
        ],
        buttons: [
            { type: 'secondary', text: 'Meer Info', image: '/media/images/icons/uncategorized/enlarge.webp' },
            { type: 'primary', text: 'Live Demo' }
        ]
    });

    rologin.buttons[0].action = rologin.enlarge.bind(rologin);
    rologin.buttons[1].action = () => window.open('https://rologin.link/');

    const privachat = new project({
        name: 'privachat',
        title: 'Private Chatting Website',
        destination: '/media/projects/privachat',
        summary: 'Een privacygerichte, invite-only chatapplicatie waarbij geen data wordt opgeslagen. Elke sessie is tijdelijk en ontworpen voor gebruikers die waarde hechten aan anonimiteit tijdens hun gesprekken.',
        description: 'PrivaChat is een privacy-first chatapplicatie die draait om vertrouwelijkheid en controle. De app werkt op basis van uitnodigingen waardoor alleen uitgenodigde deelnemers toegang hebben tot een chat. Er wordt geen data opgeslagen, niet van de gesprekken en ook niet van de gebruiker zelf. Zodra de chatroom wordt verlaten wordt de sessie automatisch verwijderd.',
        date: '18 juli 2025',
        stacks: [
            { title: 'HTML', image: '/media/images/icons/languages/front-end/html.webp' },
            { title: 'CSS', image: '/media/images/icons/languages/front-end/css.webp' },
            { title: 'JavaScript', image: '/media/images/icons/languages/front-end/js.webp' },
            { title: 'TypeScript', image: '/media/images/icons/languages/back-end/typescript.webp' },
            { title: 'JSON', image: '/media/images/icons/languages/uncategorized/json.webp' },
            { title: 'React.js', image: '/media/images/icons/languages/front-end/react.webp' },
            { title: 'Next.js', image: '/media/images/icons/languages/uncategorized/nextjs.webp' },
            { title: 'Tailwind', image: '/media/images/icons/languages/front-end/tailwind.webp' },
            { title: 'Node.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'git', image: '/media/images/icons/tools/git.webp' },
            { title: 'npm', image: '/media/images/icons/tools/npm.webp' }
        ],
        buttons: [
            { type: 'secondary', text: 'Meer Info', image: '/media/images/icons/uncategorized/enlarge.webp' }
        ]
    });

    privachat.buttons[0].action = privachat.enlarge.bind(privachat);

    const dashboard = new project({
        name: 'dashboard',
        title: 'Discord Bot Dashboard',
        destination: '/media/projects/dashboard',
        summary: 'Een dashboard voor een Discord bot waar je items kunt genereren via de site of de bot. Inclusief captcha ter preventie van misbruik en bescherming tegen CSRF-aanvallen.',
        description: 'Dit op maat gemaakte dashboard werkt samen met een Discord-bot en maakt gebruik van de Discord OAuth2 API voor de inlog. Hierdoor kunnen in-server items veilig worden gegenereerd, zowel via de website als via de bot zelf. Om misbruik te voorkomen, is het systeem voorzien van CSRF-bescherming en CAPTCHA-verificatie. Daarnaast blokkeert de backend VPN\'s en ongewenste gebruikers om de community te beschermen. Het geheel is ontworpen voor een veilige en schaalbare werking.',
        date: '19 juni 2025',
        stacks: [
            { title: 'HTML', image: '/media/images/icons/languages/front-end/html.webp' },
            { title: 'CSS', image: '/media/images/icons/languages/front-end/css.webp' },
            { title: 'JavaScript', image: '/media/images/icons/languages/front-end/js.webp' },
            { title: 'Node.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'Express.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'MySQL', image: '/media/images/icons/languages/back-end/mysql.webp' },
            { title: 'Discord API', image: '/media/images/icons/languages/back-end/discord.webp' },
            { title: 'REST APIs', image: '/media/images/icons/languages/back-end/rest.webp' },
            { title: 'Google Tools', image: '/media/images/icons/tools/google.webp' },
            { title: 'Docker', image: '/media/images/icons/tools/docker.webp' },
            { title: 'NGINX', image: '/media/images/icons/tools/nginx.webp' },
            { title: 'Cloudflare', image: '/media/images/icons/tools/cloudflare.webp' },
            { title: 'npm', image: '/media/images/icons/tools/npm.webp' }
        ],
        buttons: [
            { type: 'secondary', text: 'Meer Info', image: '/media/images/icons/uncategorized/enlarge.webp' }
        ]
    });

    dashboard.buttons[0].action = dashboard.enlarge.bind(dashboard);

    const pulsecord = new project({
        name: 'pulsecord',
        title: 'Discord Server Backup Tool',
        destination: '/media/projects/pulsecord',
        summary: 'Een tool voor Discord serverbeheerders om serverdata, rollen en leden als backup te bewaren en te herstellen. Pulsecord bevat ook beveiligingsfuncties, waaronder alt-detectie en VPN-detectie.',
        description: 'Pulsecord is een backup- en beveiligingstool voor Discord-servers, ontwikkeld voor servereigenaren en moderators. De tool maakt backups van belangrijke onderdelen zoals rollen, kanalen, permissies en leden, zodat deze gegevens veilig bewaard blijven voor het geval de server bijvoorbeeld wordt verwijderd. Daarnaast biedt Pulsecord realtime monitoring van leden. Om misbruik tegen te gaan, beschikt de tool over mechanismen voor het detecteren van alt accounts en VPN-gebruikers. Voor het ophalen van data en het uitvoeren van acties binnen de server maakt Pulsecord gebruik van de Discord API, inclusief REST endpoints.',
        date: '30 augustus 2024',
        stacks: [
            { title: 'HTML', image: '/media/images/icons/languages/front-end/html.webp' },
            { title: 'CSS', image: '/media/images/icons/languages/front-end/css.webp' },
            { title: 'JavaScript', image: '/media/images/icons/languages/front-end/js.webp' },
            { title: 'Node.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'Express.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'MySQL', image: '/media/images/icons/languages/back-end/mysql.webp' },
            { title: 'Discord API', image: '/media/images/icons/languages/back-end/discord.webp' },
            { title: 'REST APIs', image: '/media/images/icons/languages/back-end/rest.webp' },
            { title: 'Docker', image: '/media/images/icons/tools/docker.webp' },
            { title: 'NGINX', image: '/media/images/icons/tools/nginx.webp' },
            { title: 'Cloudflare', image: '/media/images/icons/tools/cloudflare.webp' },
            { title: 'npm', image: '/media/images/icons/tools/npm.webp' }
        ],
        buttons: [
            { type: 'secondary', text: 'Meer Info', image: '/media/images/icons/uncategorized/enlarge.webp' }
        ]
    });

    pulsecord.buttons[0].action = pulsecord.enlarge.bind(pulsecord);

    const portfolio = new project({
        name: 'portfolio',
        title: 'Persoonlijke Portfolio',
        destination: '/media/projects/portfolio',
        summary: 'Een verzameling van mijn persoonlijke projecten, vaardigheden en ontwikkeling die mijn creativiteit en groei als softwareontwikkelaar laten zien.',
        description: 'Deze portfolio geeft een overzicht van mijn werk en vaardigheden aan de hand van diverse persoonlijke projecten. Het laat mijn passie voor softwareontwikkeling zien, samen met mijn probleemoplossend vermogen en de drive om continu te blijven leren en verbeteren.',
        date: '30 juni 2025',
        stacks: [
            { title: 'HTML', image: '/media/images/icons/languages/front-end/html.webp' },
            { title: 'CSS', image: '/media/images/icons/languages/front-end/css.webp' },
            { title: 'JavaScript', image: '/media/images/icons/languages/front-end/js.webp' },
            { title: 'Node.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'Express.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'REST APIs', image: '/media/images/icons/languages/back-end/rest.webp' },
            { title: 'Docker', image: '/media/images/icons/tools/docker.webp' },
            { title: 'NGINX', image: '/media/images/icons/tools/nginx.webp' },
            { title: 'Cloudflare', image: '/media/images/icons/tools/cloudflare.webp' },
            { title: 'npm', image: '/media/images/icons/tools/npm.webp' }
        ],
        buttons: [
            { type: 'secondary', text: 'Meer Info', image: '/media/images/icons/uncategorized/enlarge.webp' },
            { type: 'primary', text: 'Bekijk Code' }
        ]
    });

    portfolio.buttons[0].action = portfolio.enlarge.bind(portfolio);
    portfolio.buttons[1].action = () => window.open('https://github.com/tomas-engineer/Portfolio');

    const bloxysearch = new project({
        name: 'bloxysearch',
        title: 'Roblox User Search Tool',
        destination: '/media/projects/bloxysearch',
        summary: 'Bloxysearch is een eenvoudige tool waarmee je snel gebruikersinformatie van Roblox accounts kunt ophalen.',
        description: 'Bloxysearch is een lichte en snelle tool om informatie over een Roblox gebruiker op te zoeken aan de hand van de gebruikersnaam of ID. Het toont de belangrijkste profielgegevens in een overzichtelijke interface. De tool maakt gebruik van REST API-endpoints van Roblox en een Firebase-database voor het beheren van inloggegevens.',
        date: '22 juli 2024',
        stacks: [
            { title: 'HTML', image: '/media/images/icons/languages/front-end/html.webp' },
            { title: 'CSS', image: '/media/images/icons/languages/front-end/css.webp' },
            { title: 'JavaScript', image: '/media/images/icons/languages/front-end/js.webp' },
            { title: 'Node.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'Express.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
            { title: 'Firebase', image: '/media/images/icons/languages/back-end/firebase.webp' },
            { title: 'REST APIs', image: '/media/images/icons/languages/back-end/rest.webp' },
            { title: 'npm', image: '/media/images/icons/tools/npm.webp' }
        ],
        buttons: [
            { type: 'secondary', text: 'Meer Info', image: '/media/images/icons/uncategorized/enlarge.webp' },
            { type: 'primary', text: 'Live Demo' }
        ]
    });

    bloxysearch.buttons[0].action = bloxysearch.enlarge.bind(bloxysearch);
    bloxysearch.buttons[1].action = () => window.open('https://bloxysearch.onrender.com/');

    loadedProjects.set('rologin', rologin);
    loadedProjects.set('privachat', privachat);
    loadedProjects.set('dashboard', dashboard);
    loadedProjects.set('pulsecord', pulsecord);
    loadedProjects.set('portfolio', portfolio);
    loadedProjects.set('bloxysearch', bloxysearch);
};

function showProjects() {
    loadedProjects.forEach(project => project.add());
};

/* Add projects to DOM */
loadProjects();
loadVideos();
showProjects();

/* Initialize enlarged video match */
matchEnlargedVideo();
window.addEventListener('resize', matchEnlargedVideo);

/* Initialize outer click listener */
projectEnlargeOuterElement.addEventListener('click', () => enlargedProject.close());

projectEnlargeElement.addEventListener('click', (event) => {
    const projectEnlargeVideoElement = projectEnlargeVideoOuterElement.querySelector('#project-enlarge-video');
    if (event.target === projectEnlargeVideoElement) toggleControls(projectEnlargeVideoElement);
    event.stopPropagation();
});