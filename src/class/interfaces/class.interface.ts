
export interface Section {
  id: string;
  name: string;
  studentIds: string[];
  
}

export interface SchoolClass {
  meta_id: string;
  id: string;
  name: string;
  sections: Section[];
  createdAt: number;
  updatedAt: number;
}
