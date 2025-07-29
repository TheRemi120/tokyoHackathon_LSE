import fetch from 'node-fetch';

const accessToken = 'fc76f757b1ebcb51252b707f1ff7a55b8bbab3c6';

async function getActivities() {
  const res = await fetch('https://www.strava.com/api/v3/athlete/activities', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  console.log(JSON.stringify(data));
}

getActivities();
