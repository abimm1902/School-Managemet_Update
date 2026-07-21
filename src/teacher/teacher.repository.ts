import { Inject, Injectable } from "@nestjs/common";
import { CouchbaseConnection,COUCHBASE_CONNECTION,couchbaseBucketName } from "src/config/couchbase.connection";
import { Teacher } from "./interfaces/teacher.interface";

const DOC_PREFIX = "teacher::";


@Injectable()
export class TeacherRepository{
    constructor(
        @Inject(COUCHBASE_CONNECTION)
        private readonly couchbase:CouchbaseConnection){}

 // find teacher by email
 async findTeacherByemail(email: string): Promise<Teacher | null> {
 const query = `
  SELECT t.*
  FROM \`${couchbaseBucketName}\` AS t
  WHERE STARTSWITH(META(t).id, 'teacher::')
    AND t.email = $email
  LIMIT 1
`;
  const result = await this.couchbase.cluster.query(query, { parameters: { email }, });

  const rows = result.rows as Teacher[];

  return rows.length > 0 ? rows[0] : null;
}
 
async create(teacher: Teacher): Promise<void> {
  await this.couchbase.collection.insert(
    teacher.meta_id,
    teacher,
  );
}
 async updatePW(teacher: Teacher): Promise<void> {
  await this.couchbase.collection.replace(
    teacher.meta_id,
    teacher,
  );
}


async findById(id: string): Promise<Teacher | null> {
  const docId = DOC_PREFIX + id;

  try {
    const result = await this.couchbase.collection.get(docId);
    return result.content as Teacher;
  } catch (error) {
    return null;
  }
}

  async findAll(): Promise<Teacher[]> {
    const query = `
      SELECT t.*
      FROM \`${couchbaseBucketName}\` t
      WHERE META(t).id LIKE '${DOC_PREFIX}%' `;

    const result = await this.couchbase.cluster.query(query);

    return result.rows as Teacher[];
  }


  async update(id: string, teacher: Teacher): Promise<void> {
    const docId = DOC_PREFIX + id;

    await this.couchbase.collection.replace(docId, teacher);
  }

  async remove(id: string): Promise<void> {
    const docId = DOC_PREFIX + id;

    await this.couchbase.collection.remove(docId);
  }

    }