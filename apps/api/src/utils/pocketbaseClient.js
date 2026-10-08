import PocketBase from 'pocketbase';

const pb = new PocketBase(
  (process.env.POCKETBASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '')
);

pb.autoCancellation(false);

export default pb;
