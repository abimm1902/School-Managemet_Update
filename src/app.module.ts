import { Module } from "@nestjs/common";
import { CouchbaseModule } from "./config/couchbase.module";
import { AuthModule } from "./auth/auth.module";
import { TeacherModule } from "./teacher/teacher.module";
import { StudentModule } from "./student/student.module";
import { ClassModule } from "./class/class.module";


import * as dotenv from "dotenv";

dotenv.config();

@Module({
  imports: [CouchbaseModule, AuthModule, TeacherModule,StudentModule,ClassModule,],
})
export class AppModule {}
