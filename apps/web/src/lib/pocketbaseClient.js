import PocketBase from 'pocketbase';

const baseUrl = (
  import.meta.env.VITE_POCKETBASE_URL ||
  'http://127.0.0.1:8090'
).replace(/\/$/, '');

const pb = new PocketBase(baseUrl);

// The UI already uses $autoCancel:false for long-running data operations.
pb.autoCancellation(false);

export default pb;
