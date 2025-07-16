const visitors = document?.querySelector('meta[name="visitors"]')?.getAttribute('content');
const requests = document?.querySelector('meta[name="requests"]')?.getAttribute('content');

const visitors_element = document.getElementById('visitors');
if (visitors) visitors_element.textContent = formatNumber(visitors);
else visitors_element.parentElement.remove();

const requests_element = document.getElementById('requests');
if (requests) requests_element.textContent = formatNumber(requests);
else requests_element.parentElement.remove();