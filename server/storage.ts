// Using javascript_database blueprint integration
import {
  students,
  attendance,
  leaveRecords,
  admins,
  type Student,
  type InsertStudent,
  type Attendance,
  type InsertAttendance,
  type LeaveRecord,
  type InsertLeaveRecord,
  type Admin,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Admin methods
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  
  // Student methods
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  
  // Attendance methods
  getAttendanceByMonth(year: number, month: number): Promise<Attendance[]>;
  getAttendanceByStudentId(studentId: number): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendanceForDate(studentId: number, date: string): Promise<Attendance | undefined>;
  updateAttendance(id: number, status: string): Promise<Attendance | undefined>;
  
  // Leave methods
  getLeaveRecords(): Promise<LeaveRecord[]>;
  getLeaveRecordsByStudentId(studentId: number): Promise<LeaveRecord[]>;
  createLeaveRecord(leave: InsertLeaveRecord): Promise<LeaveRecord>;
  updateLeaveRecord(id: number, data: Partial<InsertLeaveRecord>): Promise<LeaveRecord | undefined>;
  
  // Dashboard stats
  getTotalStudents(): Promise<number>;
  getPresentToday(): Promise<number>;
  getOnLeaveToday(): Promise<number>;
  getAttendanceRate(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // Admin methods
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  // Student methods
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(desc(students.createdAt));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [created] = await db.insert(students).values(student).returning();
    return created;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updated] = await db
      .update(students)
      .set(student)
      .where(eq(students.id, id))
      .returning();
    return updated || undefined;
  }

  // Attendance methods
  async getAttendanceByMonth(year: number, month: number): Promise<Attendance[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    return await db
      .select()
      .from(attendance)
      .where(
        and(
          gte(attendance.date, startDate.toISOString().split('T')[0]),
          lte(attendance.date, endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(attendance.date));
  }

  async getAttendanceByStudentId(studentId: number): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.studentId, studentId))
      .orderBy(desc(attendance.date));
  }

  async createAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    // Check if attendance already exists for this student on this date
    const existing = await this.getAttendanceForDate(
      attendanceData.studentId,
      attendanceData.date
    );

    if (existing) {
      // Update existing record
      const updated = await this.updateAttendance(existing.id, attendanceData.status);
      return updated!;
    }

    const [created] = await db.insert(attendance).values(attendanceData).returning();
    return created;
  }

  async getAttendanceForDate(studentId: number, date: string): Promise<Attendance | undefined> {
    const [record] = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.studentId, studentId), eq(attendance.date, date)));
    return record || undefined;
  }

  async updateAttendance(id: number, status: string): Promise<Attendance | undefined> {
    const [updated] = await db
      .update(attendance)
      .set({ status })
      .where(eq(attendance.id, id))
      .returning();
    return updated || undefined;
  }

  // Leave methods
  async getLeaveRecords(): Promise<LeaveRecord[]> {
    return await db.select().from(leaveRecords).orderBy(desc(leaveRecords.createdAt));
  }

  async getLeaveRecordsByStudentId(studentId: number): Promise<LeaveRecord[]> {
    return await db
      .select()
      .from(leaveRecords)
      .where(eq(leaveRecords.studentId, studentId))
      .orderBy(desc(leaveRecords.leaveDate));
  }

  async createLeaveRecord(leave: InsertLeaveRecord): Promise<LeaveRecord> {
    const leaveData = {
      ...leave,
      leaveDate: typeof leave.leaveDate === 'string' ? new Date(leave.leaveDate) : leave.leaveDate,
      returnDate: leave.returnDate ? (typeof leave.returnDate === 'string' ? new Date(leave.returnDate) : leave.returnDate) : null,
    };
    const [created] = await db.insert(leaveRecords).values(leaveData).returning();
    return created;
  }

  async updateLeaveRecord(id: number, data: Partial<InsertLeaveRecord>): Promise<LeaveRecord | undefined> {
    const updateData: any = { ...data };
    if (data.leaveDate && typeof data.leaveDate === 'string') {
      updateData.leaveDate = new Date(data.leaveDate);
    }
    if (data.returnDate && typeof data.returnDate === 'string') {
      updateData.returnDate = new Date(data.returnDate);
    }
    const [updated] = await db
      .update(leaveRecords)
      .set(updateData)
      .where(eq(leaveRecords.id, id))
      .returning();
    return updated || undefined;
  }

  // Dashboard stats
  async getTotalStudents(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(students);
    return Number(result[0]?.count || 0);
  }

  async getPresentToday(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendance)
      .where(and(eq(attendance.date, today), eq(attendance.status, 'present')));
    return Number(result[0]?.count || 0);
  }

  async getOnLeaveToday(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(leaveRecords)
      .where(eq(leaveRecords.status, 'on_leave'));
    return Number(result[0]?.count || 0);
  }

  async getAttendanceRate(): Promise<number> {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        present: sql<number>`count(*) filter (where ${attendance.status} = 'present')`,
      })
      .from(attendance);
    
    const total = Number(result[0]?.total || 0);
    const present = Number(result[0]?.present || 0);
    
    return total > 0 ? (present / total) * 100 : 0;
  }
}

export const storage = new DatabaseStorage();
