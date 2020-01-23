const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment');

const db = require('../events.json');

function getUrl (page) {
  return `https://api.mobilize.us/v1/organizations/1396/events?page=${page}&per_page=100&timeslot_start=gte_${moment().unix()}`;
}

function clean (db) {
  return;
};
module.exports.clean = clean;

module.exports.scrape = function scrape () {
  const promises = [];
  for (let i = 1; i < 5; i++)
  {
    promises.push(
      fetch(getUrl(i))
        .then(res => res.json())
        .then(data => {
          if (!data.data) {
            console.log(`No data for page ${i}.`);
            return;
          }
          data.data.forEach(event => {
            // Preserve data.
            if (db[event.id] && db[event.id].posted) { event.posted = true; }
            if (db[event.id] && db[event.id].tweetInitial) { event.tweetInitial = true; }
            db[event.id] = event;
          });
          console.log(`Processed page ${i}.`);
        })
    );
  }

  return Promise.all(promises).then(() => {
    clean(db);
    fs.writeFileSync('events.json', JSON.stringify(db));
  });
};

require('make-runnable');
