import { Inject, Injectable } from "@nestjs/common";
import {
  CouchbaseConnection,
  COUCHBASE_CONNECTION,
  couchbaseBucketName,
} from "src/config/couchbase.connection";
import { Admin } from "./interfaces/admin.interface";
import { SignupAdminDto } from "./dto/signup-admin.dto";


const DOC_PREFIX = "admin::";

@Injectable()
export class AuthRepository {
  constructor(
    @Inject(COUCHBASE_CONNECTION)
    private readonly couchbase: CouchbaseConnection,
  ) {}

  async findByEmail(email:string): Promise<Admin | null> {
    const query = `
      SELECT a.*
      FROM \`${couchbaseBucketName}\` a
      WHERE META(a).id LIKE '${DOC_PREFIX}%'
      AND a.email = $email
      LIMIT 1
    `;

    const result = await this.couchbase.cluster.query(query, {
      parameters: { email },
    });

    const rows = result.rows as Admin[];
    return rows.length ? rows[0] : null;
  }

  async create(admin: Admin): Promise<void> {
    await this.couchbase.collection.insert(admin.meta_Id, admin);
  }

  async update(admin: Admin): Promise<void> {
    await this.couchbase.collection.replace(admin.meta_Id, admin);
  }
}