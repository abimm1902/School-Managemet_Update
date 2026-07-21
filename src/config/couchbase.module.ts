import { Global, Module } from "@nestjs/common";
import { CouchbaseProvider, COUCHBASE_CONNECTION } from "./couchbase.connection";

/**
 * Marked @Global so every feature module (Auth, Teacher, Student, Class)
 * can inject COUCHBASE_CONNECTION without re-declaring the provider and
 * without opening a new connection per module. Imported once in AppModule.
 */
@Global()
@Module({
  providers: [CouchbaseProvider],
  exports: [COUCHBASE_CONNECTION],
})
export class CouchbaseModule {}
