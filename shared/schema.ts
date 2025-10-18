import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, date, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Admin users table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Attendance records table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: text("status").notNull(), // 'present', 'absent', 'leave'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Leave records table
export const leaveRecords = pgTable("leave_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  leaveDate: timestamp("leave_date").notNull(),
  leaveReason: text("leave_reason").notNull(),
  returnDate: timestamp("return_date"),
  status: text("status").notNull().default("on_leave"), // 'on_leave', 'returned'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  attendance: many(attendance),
  leaveRecords: many(leaveRecords),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
}));

export const leaveRecordsRelations = relations(leaveRecords, ({ one }) => ({
  student: one(students, {
    fields: [leaveRecords.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  profileImage: z.string().optional(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.enum(["present", "absent", "leave"]),
  notes: z.string().optional(),
});

export const insertLeaveRecordSchema = createInsertSchema(leaveRecords).omit({
  id: true,
  createdAt: true,
}).extend({
  leaveReason: z.string().min(5, "Reason must be at least 5 characters"),
  status: z.enum(["on_leave", "returned"]).default("on_leave"),
});

// Types
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type LeaveRecord = typeof leaveRecords.$inferSelect;
export type InsertLeaveRecord = z.infer<typeof insertLeaveRecordSchema>;
