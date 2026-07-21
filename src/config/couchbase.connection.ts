import { Provider } from "@nestjs/common";
import { connect, Cluster, Collection } from "couchbase";

const COUCHBASE_CONNECTION_STRING = process.env.COUCHBASE_CONNECTION_STRING || "couchbases://cb.wm1mjtm7kzziiz.cloud.couchbase.com";
const COUCHBASE_USERNAME = process.env.COUCHBASE_USERNAME || "Abinaya";
const COUCHBASE_PASSWORD = process.env.COUCHBASE_PASSWORD || "ruthiksha@M11";
const COUCHBASE_BUCKET_NAME = process.env.COUCHBASE_BUCKET_NAME || "School_db";
const COUCHBASE_SCOPE_NAME = "_default";
const COUCHBASE_COLLECTION_NAME = "_default";

export const couchbaseBucketName = COUCHBASE_BUCKET_NAME;
export const COUCHBASE_CONNECTION = "COUCHBASE_CONNECTION";

export interface CouchbaseConnection {
  cluster: Cluster;
  collection: Collection;
}


export const CouchbaseProvider: Provider = {
  provide: COUCHBASE_CONNECTION,
  useFactory: async (): Promise<CouchbaseConnection> => {
    const cluster: Cluster = await connect(COUCHBASE_CONNECTION_STRING, {
      username: COUCHBASE_USERNAME,
      password: COUCHBASE_PASSWORD,
    });

    const bucket = cluster.bucket(COUCHBASE_BUCKET_NAME);
    const scope = bucket.scope(COUCHBASE_SCOPE_NAME);
    const collection = scope.collection(COUCHBASE_COLLECTION_NAME);

    console.log(`Connected to Couchbase bucket: ${COUCHBASE_BUCKET_NAME}`);
    return { cluster, collection };
  },
};
