import {  BadRequestException,  Injectable,  NotFoundException,} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { ClassRepository } from "./class.repository";
import { Section, SchoolClass} from "./interfaces/class.interface";
import { CreateClassDto, CreateSectionDto } from "./dto/create-class.dto";
import { UpdateClassDto, UpdateSectionDto } from "./dto/update-class.dto";
import { AssignStudentDto } from "./dto/assign-student.dto";
import {Subject} from "./interfaces/subject.interface"
import { CreateSubjectDto} from "./dto/create-subject.dto";
import { AssignTeacherDto } from "./dto/assign-teacher.dto";



const DOC_PREFIX = "subject::";
@Injectable()
export class ClassService {
  constructor(private readonly classRepo: ClassRepository) {}

  /** CREATE - add a new class (e.g. "Class 7"). Admin only, enforced at the controller. */
  async create(dto: CreateClassDto) {
    const existing = await this.classRepo.findByName(dto.name);
    if (existing) {
      throw new BadRequestException(
        `A class named "${dto.name}" already exists`
      );
    }

    const id = uuidv4();
    const newClass: SchoolClass = {
      meta_id: `class::${id}`,
      id,
      name: dto.name,
      sections: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await this.classRepo.create(newClass);
    return newClass;
  }
   //create Subject
    async createSubject (dto:CreateSubjectDto){
       
      const existing=await this.classRepo.findByName(dto.name);
     if (existing) {
           throw new BadRequestException(
             `A subject named "${dto.name}" already exists`
           );
         }
         const id = uuidv4();
       const newSubject: Subject = {
           meta_id:`subject::${id}`,
           id,
           name:dto.name,
           sectionId:dto.sectionId,
           classId:dto.classId,
       
         };
   
    await this.classRepo.createsub(newSubject);
       return newSubject;
   
    }
   
   
    /** GET ALL */
     async findAllSub(): Promise<Subject[]> {
       return await this.classRepo.findAllSub();
     }
      
   
    async assignTeacher(subjectId:string,dto:AssignTeacherDto):Promise<Subject>{
       // 1. Find the subject from database
     const subject = await this.classRepo.findByIdsub(subjectId);
   
     if (!subject) {
       throw new NotFoundException("Subject not found");
     }
   
     if (subject.teacherId === dto.teacherId) {
        return subject;
     }
   
      subject.teacherId = dto.teacherId;
   
     await this.classRepo.updateSub(subject);
   
     return subject;
    }
   

   


  /** Add a section (e.g. "A", "B") to an existing class. Admin only. */
  async addSection(  classId: string,  dto: CreateSectionDto ): Promise<SchoolClass> {
    const schoolClass = await this.getOrThrow(classId);

    const sectionExists = schoolClass.sections.some(
      (section) => section.name.toLowerCase() === dto.name.toLowerCase()
    );
    if (sectionExists) {
      throw new BadRequestException(
        `Section "${dto.name}" already exists in this class`
      );
    }

    const newSection: Section = {
      id: uuidv4(),
      name: dto.name,
      studentIds: [],
      
    };

    schoolClass.sections.push(newSection);
    schoolClass.updatedAt = Date.now();

    await this.classRepo.update(schoolClass);
    return schoolClass;
  }


  //Assign a student to a class + section.
  
  
  async assignStudent( classId: string,  dto: AssignStudentDto
  ): Promise<SchoolClass> {
    const schoolClass = await this.getOrThrow(classId);

    const section = schoolClass.sections.find((s) => s.id === dto.sectionId);
    if (!section) {
      throw new NotFoundException("Section not found");
    }

    const existingAssignment = await this.classRepo.findClassContainingStudent(
      dto.studentId
    );
    if (existingAssignment) {
      throw new BadRequestException(
        `Student is already assigned to class "${existingAssignment.name}"`
      );
    }

    section.studentIds.push(dto.studentId);
    schoolClass.updatedAt = Date.now();

    await this.classRepo.update(schoolClass);
    return schoolClass;
  }

  /** Remove a student from a section (e.g. before moving them elsewhere). Admin only. */
  async removeStudent(
    classId: string,
    sectionId: string,
    studentId: string
  ): Promise<SchoolClass> {
    const schoolClass = await this.getOrThrow(classId);

    const section = schoolClass.sections.find((s) => s.id === sectionId);
    if (!section) {
      throw new NotFoundException("Section not found");
    }

    if (!section.studentIds.includes(studentId)) {
      throw new NotFoundException("Student is not in this section");
    }

    section.studentIds = section.studentIds.filter((id) => id !== studentId);
    schoolClass.updatedAt = Date.now();

    await this.classRepo.update(schoolClass);
    return schoolClass;
  }

  // READ (single) 
  async findOne(id: string): Promise<SchoolClass> {
    return this.getOrThrow(id);
  }

  // READ (all) 
  async findAll(): Promise<SchoolClass[]> {
    return this.classRepo.findAll();
  }

  // UPDATE - rename a class 
  async update(id: string, dto: UpdateClassDto): Promise<SchoolClass> {
    const existing = await this.getOrThrow(id);

    if (dto.name) {
      const duplicate = await this.classRepo.findByName(dto.name);
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(
          `A class named "${dto.name}" already exists`
        );
      }
    }

      let updatedSections = existing.sections;
      
    if (dto.sections) {
    updatedSections = existing.sections.map((existingSection) => {
      const updatedSection = dto.sections?.find(
        (section) => section.id === existingSection.id,
      );

      if (updatedSection) {
        return {
          ...existingSection,
          ...updatedSection,
        };
      }
      return existingSection;
    });
  }

    const updated: SchoolClass = {
      ...existing,
      ...dto,
      sections: updatedSections,
      id,
      updatedAt: Date.now(),
    };

    await this.classRepo.update(updated);
    return updated;
  }

  // DELETE 
  async remove(id: string): Promise<{ message: string }> {
    await this.getOrThrow(id); // throws if not found
    await this.classRepo.remove(id);
    return { message: "Class deleted successfully" };
  }

private async getOrThrow(id: string): Promise<SchoolClass> {
    const schoolClass = await this.classRepo.findById(id);
    if (!schoolClass) {
      throw new NotFoundException(`Class with id ${id} not found`);
    }
    return schoolClass;
  }
}
