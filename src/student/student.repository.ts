import { Inject, Injectable } from "@nestjs/common";
import { CouchbaseConnection,COUCHBASE_CONNECTION,couchbaseBucketName } from "src/config/couchbase.connection";
import { Student } from "./interfaces/student.interface";


const DOC_PREFIX = "student::";


@Injectable()
export class StudentRepository{
    constructor(
        @Inject(COUCHBASE_CONNECTION)
        private readonly couchbase:CouchbaseConnection){}

 // find student by email
 async  findStudentByemail(email:string):Promise<Student | null>{
    const query=`SELECT s.*
         FROM \`${couchbaseBucketName}\` s
          WHERE META(s).id LIKE 'student::%'
           AND s.email = $email LIMIT 1`;
     const result=await this.couchbase.cluster.query(query,{parameters:{email}});

     const rows=result.rows as Student[];
    
    return rows.length > 0 ? rows[0]:null; 
 }
 
async create(student: Student): Promise<void> {
  await this.couchbase.collection.insert(
    student.meta_id,
    student,
  );
}
 async updatePW(student: Student): Promise<void> {
  await this.couchbase.collection.replace(
    student.meta_id,
    student,
  );
}

async findById(id: string): Promise<Student | null> {
  const docId = DOC_PREFIX + id;

  try {
    const result = await this.couchbase.collection.get(docId);
    return result.content as Student;
  } catch (error) {
    return null;
  }
}

  async findAll(): Promise<Student[]> {
    const query = `
      SELECT s.*
      FROM \`${couchbaseBucketName}\` s
      WHERE META(s).id LIKE '${DOC_PREFIX}%'
    `;

    const result = await this.couchbase.cluster.query(query);

    return result.rows as Student[];
  }


  async update(id: string, student: Student): Promise<void> {
    const docId = DOC_PREFIX + id;

    await this.couchbase.collection.replace(docId, student);
  }

  async remove(id: string): Promise<void> {
    const docId = DOC_PREFIX + id;

    await this.couchbase.collection.remove(docId);
  }
}


    