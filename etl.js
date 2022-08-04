#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const core = require('@actions/core');

const AIRTABLE = {
  domain: 'https://api.airtable.com',
  path: '/v0/appQeNGOVlznG2nqu/',
  view: 'Grid view',
  tables: ['Questions', 'Concepts', 'Lectures', 'Tools'],
  key: process.env.AIRTABLE_API_KEY,
}

const dataFolder = '/public/data';

async function getDataRecursive(endpoint, offsetId) {
  let originalEndpoint = endpoint;
  let offsetableEndpoint = endpoint;

  if (offsetId) {
    offsetableEndpoint = `${originalEndpoint}&offset=${offsetId}`;
  }

  console.log(`Pulling from ${endpoint}`);

  try {
    const { data: { records, offset } } = await axios(offsetableEndpoint, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE.key}`,
      },
    });

    const normalized = records.map(r => {
      return { id: r.id, ...r.fields };
    });

    if (offset) {
      return [...normalized, ...(await getDataRecursive(originalEndpoint, offset))];
    };

    return normalized;
  } catch (e) {
    core.setFailed(e);
  }
}

// execute and persist data
Promise.all(AIRTABLE.tables.map(table => {
  return getDataRecursive(`${AIRTABLE.domain}${AIRTABLE.path}${table}?view=${AIRTABLE.view}`)
    .then((data) => {
      const pathToData = (ext = '.json') => path.join(__dirname, dataFolder, `${table}`.toLowerCase()) + ext;

      // persist data
      fs.writeFileSync(path.resolve(pathToData('.json')), JSON.stringify(data, null, 2));
      fs.writeFileSync(path.resolve(pathToData('.min.json')), JSON.stringify(data));
    })
})).catch(e =>{console.log(e); core.setFailed(e)});
