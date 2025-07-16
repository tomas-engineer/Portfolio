const lock_form_element = document.getElementById('lock-form');
const lock_key_element = document.getElementById('lock-key');

lock_form_element.addEventListener('submit', async (event) => {
    event.preventDefault();

    const key = lock_key_element?.value;
    if (!key) return alert('U heeft geen sleutel opgegeven');

    const response = await fetch('/key/validate', {
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
        else window.location.href = '/';
    } catch(err) {
        console.error(err);
        alert(`Er ging iets mis tijdens het valideren${err?.message ? ': ' + err.message : ''}`);
    }
});