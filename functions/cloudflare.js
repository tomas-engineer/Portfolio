import 'dotenv/config';

const CLOUDFLARE_TOKEN = process.env.CLOUDFLARE_TOKEN;

var requests = null;
var visitors = null;

const format = (date) => new Date(date).toISOString();

const queries = {
    uniques: (start, end) => `
    query {
      viewer {
        zones {
          zoneTag
          totals: httpRequests1hGroups(
            limit: 10000,
            filter: { datetime_geq: "${format(start)}", datetime_lt: "${format(end)}" }
          ) {
            uniq {
              uniques
            }
          }
        }
      }
    }
  `,

    requests: (start, end) => `
    query {
      viewer {
        zones {
          zoneTag
          totals: httpRequests1hGroups(
            limit: 10000,
            filter: { datetime_geq: "${format(start)}", datetime_lt: "${format(end)}" }
          ) {
            sum {
              requests
            }
          }
        }
      }
    }
  `,

    combined: (start, end) => `
    query {
      viewer {
        zones {
          zoneTag
          totals: httpRequests1hGroups(
            limit: 10000,
            filter: { datetime_geq: "${format(start)}", datetime_lt: "${format(end)}" }
          ) {
            uniq {
              uniques
            }
            sum {
              requests
            }
          }
        }
      }
    }
  `,
};

async function gather(query) {
    try {
        const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
            method: 'post',
            headers: {
                'Authorization': 'Bearer ' + CLOUDFLARE_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!res.ok) throw new Error(`HTTP error: ${res.status}, ${res.statusText}`);

        const data = await res?.json();
        if (!data) throw new Error(`Unexpected response format from Cloudflare API`);

        return data;
    } catch (error) {
        console.log('Something went wrong gathering the graphql data: ' + error?.message);
        return;
    }
};

async function gatherVisitors(start = Date.now() - (3 * 24 * 60 * 60 * 1000), end = Date.now()) {
    try {
        const data = await gather(queries.uniques(start, end));
        if (!data) return;

        const zones = data?.data?.viewer?.zones;
        if (!zones) throw new Error(`Unexpected response format from Cloudflare API: missing zones data: ${JSON.stringify(data)}`);

        let _visitors = 0;
        for (const zone of zones) {
            const count = zone?.totals?.[0]?.uniq?.uniques || 0;
            _visitors += count;
        }

        visitors = _visitors;
    } catch (error) {
        console.log('Something went wrong getting the unique visitors: ' + error?.message);
    }
};

async function gatherRequests(start = Date.now() - (3 * 24 * 60 * 60 * 1000), end = Date.now()) {
    try {
        const data = await gather(queries.requests(start, end));
        if (!data) return;

        const zones = data?.data?.viewer?.zones;
        if (!zones) throw new Error(`Unexpected response format from Cloudflare API: missing zones data: ${JSON.stringify(data)}`);

        let _requests = 0;
        for (const zone of zones) {
            const count = zone?.totals?.[0]?.sum?.requests || 0;
            _requests += count;
        }

        requests = _requests;
    } catch (error) {
        console.log('Something went wrong getting the unique visitors: ' + error?.message);
    }
};

async function gatherCombined(start = Date.now() - (3 * 24 * 60 * 60 * 1000), end = Date.now()) {
    try {
        const data = await gather(queries.combined(start, end));
        if (!data) return;

        const zones = data?.data?.viewer?.zones;
        if (!zones) throw new Error(`Unexpected response format from Cloudflare API: missing zones data: ${JSON.stringify(data)}`);

        let _requests = null;
        let _visitors = null;

        for (const zone of zones) {
            const r_count = zone?.totals?.[0]?.sum?.requests || 0;
            const v_count = zone?.totals?.[0]?.uniq?.uniques || 0;

            _requests += r_count;
            _visitors += v_count;
        }

        requests = _requests;
        visitors = _visitors;
    } catch (error) {
        console.log('Something went wrong getting the unique visitors: ' + error?.message);
    }
};

const getVisitors = () => visitors;
const getRequests = () => requests;
const getCombined = () => ({ requests, visitors });

export {
    gatherVisitors,
    gatherRequests,
    gatherCombined,
    getVisitors,
    getRequests,
    getCombined
};