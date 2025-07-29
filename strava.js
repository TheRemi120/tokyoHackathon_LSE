import fetch from 'node-fetch';

const accessToken = 'ACCESS_TOKEN';

async function getActivities() {
  const res = await fetch('https://www.strava.com/api/v3/athlete/activities', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  console.log(JSON.stringify(data));
}

getActivities();
