import { MongoClient } from "mongodb";

let clientPromise = null;
let cachedUri = null;

function isPlaceholder(v) {
  return !v || /username:password|yourDatabaseName|cluster-host/.test(v);
}

async function init() {
  if (clientPromise) return clientPromise;
  const uri = process.env.MONGODB_URI;
  if (isPlaceholder(uri)) {
    throw new Error("MONGODB_URI not configured with a real connection string");
  }
  cachedUri = uri;
  const client = new MongoClient(uri, { maxPoolSize: 10 });
  clientPromise = client.connect();
  return clientPromise;
}

export async function getDb() {
  const client = await init();
  const dbName =
    process.env.MONGODB_DB ||
    (cachedUri && cachedUri.split("/").pop().split("?")[0]);
  if (!dbName) throw new Error("Could not determine database name");
  return client.db(dbName);
}
