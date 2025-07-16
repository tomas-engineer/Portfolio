const lock_form_element = document.getElementById('lock-form');
const keys_amount_element = document.getElementById('keys-amount');
const keys_output_element = document.getElementById('keys-output');

const range_input_element = document.getElementById('keys-amount');
const range_output_element = document.getElementById('keys-value');

const standard_login_element = document.getElementById('standard-login');
const logout_element = document.getElementById('logout');

const existing_keys_element = document.getElementById('existing-keys');

// Keys slider
range_output_element.textContent = range_input_element.value;

range_input_element.addEventListener('input', function () {
    range_output_element.textContent = this.value;
});

// Form submit
lock_form_element.addEventListener('submit', async (event) => {
    event.preventDefault();

    const amount = keys_amount_element.value;
    if (!amount) return alert('U moet een hoeveelheid geven');

    const response = await fetch('/key/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            amount
        })
    })

    try {
        const data = await response.json();
        const { success, keys, message } = data;

        if (!success) alert(message);
        else {
            loadKeys();
            if (keys_output_element.textContent.length > 0) keys_output_element.textContent += '\r\n';
            keys_output_element.textContent += keys.join('\r\n');
        }
    } catch(err) {
        console.error(err);
        alert(`Er ging iets mis tijdens het genereren van sleutels${err?.message ? ': ' + err.message : ''}`);
    }
});

// Standard login
standard_login_element.addEventListener('click', async () => {
    const response = await fetch('/key/swap', {
        method: 'POST'
    })

    try {
        const data = await response.json();
        const { success, message } = data;

        if (!success) alert(message);
        else document.location.href = '/';
    } catch(err) {
        console.error(err);
        alert(`Er ging iets mis tijdens het swappen${err?.message ? ': ' + err.message : ''}`);
    }
});

// Logout
logout_element.addEventListener('click', async () => {
    const response = await fetch('/key/logout', {
        method: 'POST'
    })

    try {
        const data = await response.json();
        const { success, message } = data;

        if (!success) alert(message);
        else document.location.href = '/';
    } catch(err) {
        console.error(err);
        alert(`Er ging iets mis tijdens het uit loggen${err?.message ? ': ' + err.message : ''}`);
    }
});


// Get all keys
function createKeyElement(key, expires, used) {
    const wrapper = document.createElement('div');
    wrapper.className = 'existing-key';

    const info = document.createElement('div');
    info.className = 'existing-key-info';

    const keySpan = document.createElement('span');
    keySpan.className = 'existing-key-value';
    keySpan.innerHTML = `<b>${key}</b>`;
    info.appendChild(keySpan);

    info.appendChild(document.createElement('br'));

    const row = document.createElement('div');
    row.className = 'existing-key-row';

    const expiresSpan = document.createElement('span');
    expiresSpan.className = 'existing-key-ip';
    expiresSpan.innerHTML = `<b>Expires:</b> ${expires.split('T')[0]}`;
    row.appendChild(expiresSpan);

    const statusSpan = document.createElement('span');
    statusSpan.className = 'existing-key-used';
    statusSpan.innerHTML = `<b>status:</b> ${used ? 'used' : 'unused'}`;
    row.appendChild(statusSpan);

    info.appendChild(row);

    const actions = document.createElement('div');
    actions.className = 'existing-key-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteKey(key))
    actions.appendChild(deleteBtn);

    wrapper.appendChild(info);
    wrapper.appendChild(actions);

    existing_keys_element.appendChild(wrapper);
}

async function loadKeys() {
    existing_keys_element.innerHTML = '';
    const response = await fetch('/key/retrieve', {
        method: 'POST',

    })

    try {
        const data = await response.json();
        const { success, keys, message } = data;

        if (!success) alert(message);

        else {
            for (const object of keys) {
                const key = object.key;
                const expires = object.expires;
                const used = object.used;
                createKeyElement(key, expires, used);
            }
        };
    } catch(err) {
        console.error(err);
        alert(`Er ging iets mis tijdens het ophalen van de bestaanden sleutels${err?.message ? ': ' + err.message : ''}`);
    }
}

async function deleteKey(key) {
    const response = await fetch('/key/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            key
        })
    })

    try {
        const data = await response.json();
        const { success, message } = data;

        if (!success) alert(message);
        else loadKeys();
    } catch(err) {
        console.error(err);
        alert(`Er ging iets mis tijdens het ophalen van de bestaanden sleutels${err?.message ? ': ' + err.message : ''}`);
    }
}

loadKeys();