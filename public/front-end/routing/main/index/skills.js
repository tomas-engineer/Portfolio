const selectorButtons = document.getElementsByClassName('selector-button');

const skillsToolsBody = document.getElementById('skills-tools-body');
const skillsToolsHolder = document.getElementById('skills-tools-holder');

const createdCards = new Map();

var frontEndSkills = [
    { name: 'HTML', image: '/media/images/icons/languages/front-end/html.webp' },
    { name: 'CSS', image: '/media/images/icons/languages/front-end/css.webp' },
    { name: 'SCSS', image: '/media/images/icons/languages/front-end/scss.webp' },
    { name: 'Bootstrap', image: '/media/images/icons/languages/front-end/bootstrap.webp' },
    { name: 'Tailwind', image: '/media/images/icons/languages/front-end/tailwind.webp' },
    { name: 'JavaScript', image: '/media/images/icons/languages/front-end/js.webp' },
    { name: 'JSON', image: '/media/images/icons/languages/uncategorized/json.webp' },
    { name: 'React.js', image: '/media/images/icons/languages/front-end/react.webp' },
    { name: 'Next.js', image: '/media/images/icons/languages/uncategorized/nextjs.webp' },
    { name: 'Vite', image: '/media/images/icons/languages/front-end/vite.webp' }
];

var backEndSkills = [
    { name: 'JavaScript', image: '/media/images/icons/languages/front-end/js.webp' },
    { name: 'TypeScript', image: '/media/images/icons/languages/back-end/typescript.webp' },
    { name: 'Node.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
    { name: 'Express.js', image: '/media/images/icons/languages/back-end/nodejs.webp' },
    { name: 'REST APIs', image: '/media/images/icons/languages/back-end/rest.webp' },
    { name: 'JSON', image: '/media/images/icons/languages/uncategorized/json.webp' },
    { name: 'Discord API', image: '/media/images/icons/languages/back-end/discord.webp' },
    { name: 'Firebase', image: '/media/images/icons/languages/back-end/firebase.webp' },
    { name: 'MySQL', image: '/media/images/icons/languages/back-end/mysql.webp' },
    { name: 'SQLite', image: '/media/images/icons/languages/back-end/sqlite.webp' },
    { name: 'Next.js', image: '/media/images/icons/languages/uncategorized/nextjs.webp' },
    { name: 'Lua', image: '/media/images/icons/languages/back-end/lua.webp' }
];

var devOpsTools = [
    { name: 'Docker', image: '/media/images/icons/tools/docker.webp' },
    { name: 'NGINX', image: '/media/images/icons/tools/nginx.webp' },
    { name: 'Cloudflare', image: '/media/images/icons/tools/cloudflare.webp' },
    { name: 'DirectAdmin', image: '/media/images/icons/tools/directadmin.webp' },
    { name: 'Raspberry Pi', image: '/media/images/icons/tools/raspberrypi.webp' },
    { name: 'Ubuntu', image: '/media/images/icons/tools/ubuntu.webp' },
    { name: 'Bash', image: '/media/images/icons/tools/bash.webp' },
    { name: 'git', image: '/media/images/icons/tools/git.webp' },
    { name: 'GitHub', image: '/media/images/icons/tools/github.webp' }
];

var otherTools = [
    { name: 'VS Code', image: '/media/images/icons/tools/vscode.webp' },
    { name: 'Chrome Extensions', image: '/media/images/icons/tools/chromeextensions.webp' },
    { name: 'Figma', image: '/media/images/icons/tools/figma.webp' },
    { name: 'Postman', image: '/media/images/icons/tools/postman.webp' },
    { name: 'npm', image: '/media/images/icons/tools/npm.webp' },
    { name: 'WordPress', image: '/media/images/icons/tools/wordpress.webp' },
    { name: 'Stripe', image: '/media/images/icons/tools/stripe.webp' },
    { name: 'Google Tools', image: '/media/images/icons/tools/google.webp' },
    { name: 'Notion', image: '/media/images/icons/tools/notion.webp' },
    { name: 'ClickUp', image: '/media/images/icons/tools/clickup.webp' }
];

function createCard(name, image) {
    const card = document.createElement('div');
    card.className = 'skill-card';

    const img = document.createElement('img');
    img.className = 'skill-image';
    img.src = image;
    img.loading = "lazy";
    card.appendChild(img);

    const label = document.createElement('span');
    label.className = 'skill-name';
    label.textContent = name;
    card.appendChild(label);

    createdCards.set(name.toLowerCase(), card);
};

function showCard(name) {
    const card = createdCards.get(name.toLowerCase())?.cloneNode(true);
    if (card) skillsToolsBody.appendChild(card);
};

function loadCards() {
    [frontEndSkills, backEndSkills, devOpsTools, otherTools].forEach(array => {
        for (const selector of array) {
            const { name, image } = selector;
            createCard(name, image);
        }
    });
};

function updateTab(selector) {
    skillsToolsBody.innerHTML = '';
    
    const array = selector == 'Front-End' ? frontEndSkills : selector == 'Back-End' ? backEndSkills : selector == 'DevOps' ? devOpsTools : otherTools;
    for (const selector of array) {
        const { name } = selector;
        showCard(name);
    }
};

function updateSelector(element) {
    const selected = 'selector-button-selected';
    if (element.classList.contains(selected)) return;

    for (const selector_button of Array.from(selectorButtons)) {
        if (selector_button == element) element.classList.add(selected);
        else selector_button.classList.remove(selected);
    }

    updateTab(element.textContent);
};

for (const selector_button of Array.from(selectorButtons)) {
    selector_button.addEventListener('click', () => updateSelector(selector_button));
}

loadCards();
updateTab('Front-End');