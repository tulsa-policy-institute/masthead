#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const core = require('@actions/core');

const AIRTABLE = {
  domain: 'https://api.airtable.com',
  path: '/v0/appQeNGOVlznG2nqu/',
  maxRecords: -1,
  view: 'Grid view',
  tables: ['Questions', 'Concepts', 'Lectures', 'Tools'],
  key: process.env.AIRTABLE_API_KEY,
}

const dataFolder = '/public/data';

async function getData(endpoint) {
  try {
    const { data: { records, offset } } = await axios(endpoint, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE.key}`,
      },
    });

    const normalized = records.map(r => {
      return { id: r.id, ...r.fields };
    });

    if (offset) {
      return [...normalized, ...(await getData(`${endpoint}&offset=${offset}`))];
    };

    return normalized;
  } catch (e) {
    core.setFailed(e);
  }
}

// execute and persist data
Promise.all(AIRTABLE.tables.map(table => {
  return getData(`${AIRTABLE.domain}${AIRTABLE.path}${table}?maxRecords=${AIRTABLE.maxRecords}&view=${AIRTABLE.view}`)
    .then((data) => {
      const pathToData = (ext = '.json') => path.join(__dirname, dataFolder, `${table}`.toLowerCase()) + ext;

      // persist data
      fs.writeFileSync(path.resolve(pathToData('.json')), JSON.stringify(data, null, 2));
      fs.writeFileSync(path.resolve(pathToData('.min.json')), JSON.stringify(data));
    })
})).catch(e => core.setFailed(e));
