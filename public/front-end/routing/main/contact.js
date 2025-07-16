const contact_form_element = document.getElementById('contact-form');
const contact_outcome_element = document.getElementById('contact-outcome');
const outcome_text_element = document.getElementById('outcome-text');

contact_form_element.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = contact_form_element.querySelector('#contact-name')?.value;
    const email = contact_form_element.querySelector('#contact-email')?.value;
    const message = contact_form_element.querySelector('#contact-message')?.value;
    
    if (!name || !email || !message) {
        contact_outcome_element.setAttribute('data-success', 'false');
        outcome_text_element.textContent = 'Er zijn velden niet ingevuld';
        return;
    }

    const response = await fetch('/mail/send', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name, email, message
        })
    });

    try {
        const data = await response.json();
        const { success, message } = data;

        if (!success) throw new Error(message);
        else {
            contact_outcome_element.setAttribute('data-success', 'true');
            outcome_text_element.textContent = message;
        };
    } catch (err) {
        console.error(err);

        if (err.message) {
            contact_outcome_element.setAttribute('data-success', 'false');
            outcome_text_element.textContent = err.message;
        } else alert('Fout bij verzenden van uw e-mail. Probeer het later opnieuw');
    }
});