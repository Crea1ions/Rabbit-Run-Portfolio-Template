const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

exports.handler = async function handler() {
  const root = path.resolve(__dirname, '..', '..');
  const payload = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NETLIFY ? 'netlify' : 'local',
    artworksVersion: null,
    artworksCount: null,
    errors: []
  };

  try {
    const raw = fs.readFileSync(path.join(root, 'artworks.json'), 'utf-8');
    payload.artworksVersion = crypto.createHash('sha256').update(raw).digest('hex');
    payload.artworksCount = JSON.parse(raw).length;
  } catch (err) {
    payload.errors.push(err.message);
    payload.status = 'degraded';
  }

  return {
    statusCode: payload.errors.length ? 503 : 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };
};
