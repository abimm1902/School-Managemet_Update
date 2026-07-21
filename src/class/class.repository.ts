import { Inject, Injectable } from "@nestjs/common";
import {  COUCHBASE_CONNECTION,  CouchbaseConnection,  couchbaseBucketName,} from "../config/couchbase.connection";
import { SchoolClass } from "./interfaces/class.interface";

const DOC_PREFIX = "class::";

@Injectable()
export class ClassRepository {
  constructor(
    @Inject(COUCHBASE_CONNECTION)
    private readonly couchbase: CouchbaseConnection
  ) {}

  private docId(id: string): string {
    return DOC_PREFIX + id;
  }

  /** CREATE */
  async create(schoolClass: SchoolClass): Promise<void> {
    await this.couchbase.collection.insert(
      this.docId(schoolClass.id),
      schoolClass
    );
  }

  /** READ (single) */
  async findById(id: string): Promise<SchoolClass | null> {
    try {
      const result = await this.couchbase.collection.get(this.docId(id));
      return result.content as SchoolClass;
    } catch {
      return null;
    }
  }

  //  look up a class by its name (case-insensitive), used to stop duplicate classes 
  async findByName(name: string): Promise<SchoolClass | null> {
    const query = `
      SELECT c.* FROM \`${couchbaseBucketName}\` c
      WHERE META(c).id LIKE '${DOC_PREFIX}%'
        AND LOWER(c.name) = LOWER($name)
      LIMIT 1
    `;
    const result = await this.couchbase.cluster.query(query, {
      parameters: { name },
    });
    return (result.rows[0] as SchoolClass) ?? null;
  }

  /** READ (all) */
  async findAll(): Promise<SchoolClass[]> {
    const query = `SELECT c.* FROM \`${couchbaseBucketName}\` c WHERE META(c).id LIKE '${DOC_PREFIX}%'`;
    const result = await this.couchbase.cluster.query(query);
    return result.rows as SchoolClass[];
  }

  /**
   * Find the class (anywhere in the whole school) whose sections already
   * contain this student. Used to enforce "a student can only belong to
   * ONE class + section at a time", across every class document.
   */
  async findClassContainingStudent(
    studentId: string
  ): Promise<SchoolClass | null> {
    const query = `
      SELECT c.* FROM \`${couchbaseBucketName}\` c
      WHERE META(c).id LIKE '${DOC_PREFIX}%'
        AND ANY s IN c.sections SATISFIES $studentId IN s.studentIds 
      LIMIT 1
    `;
    const result = await this.couchbase.cluster.query(query, {
      parameters: { studentId },
    });
    return (result.rows[0] as SchoolClass) ?? null;
  }

  
  /** UPDATE (full document replace) */
  async update(schoolClass: SchoolClass): Promise<void> {
    await this.couchbase.collection.upsert(
      this.docId(schoolClass.id),
      schoolClass
    );
  }


  /** DELETE */
  async remove(id: string): Promise<void> {
    await this.couchbase.collection.remove(this.docId(id));
  }
}
