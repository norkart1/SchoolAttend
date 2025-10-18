import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertStudentSchema, insertAttendanceSchema, insertLeaveRecordSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "./db";
import { sql } from "drizzle-orm";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set. Please provide a secure JWT secret.");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "24h";

interface JWTPayload {
  adminId: number;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: JWTPayload;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // JWT Auth middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.admin = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const admin = await storage.getAdminByUsername(username);

      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare password with hashed password
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { adminId: admin.id, username: admin.username } as JWTPayload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Set token in HTTP-only cookie for security
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.json({ success: true, username: admin.username, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/check", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      res.json({ authenticated: true, username: decoded.username });
    } catch (error) {
      res.status(401).json({ authenticated: false });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  // Student routes
  app.get("/api/students", requireAuth, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json(student);
    } catch (error) {
      console.error("Get student error:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", requireAuth, async (req, res) => {
    try {
      const validated = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validated);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create student error:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.patch("/api/students/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(id, validated);

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Update student error:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.get("/api/students/:id/attendance", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const records = await storage.getAttendanceByStudentId(id);
      res.json(records);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/students/:id/leaves", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const records = await storage.getLeaveRecordsByStudentId(id);
      res.json(records);
    } catch (error) {
      console.error("Get leaves error:", error);
      res.status(500).json({ message: "Failed to fetch leaves" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      const monthParam = req.query.month as string;
      if (!monthParam) {
        return res.status(400).json({ message: "Month parameter required (YYYY-MM)" });
      }

      const [year, month] = monthParam.split("-").map(Number);
      const records = await storage.getAttendanceByMonth(year, month);
      res.json(records);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", requireAuth, async (req, res) => {
    try {
      const validated = insertAttendanceSchema.parse(req.body);
      const record = await storage.createAttendance(validated);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create attendance error:", error);
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  // Leave routes
  app.get("/api/leaves", requireAuth, async (req, res) => {
    try {
      const records = await storage.getLeaveRecords();
      res.json(records);
    } catch (error) {
      console.error("Get leaves error:", error);
      res.status(500).json({ message: "Failed to fetch leave records" });
    }
  });

  app.post("/api/leaves", requireAuth, async (req, res) => {
    try {
      const validated = insertLeaveRecordSchema.parse(req.body);
      const record = await storage.createLeaveRecord(validated);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Create leave error:", error);
      res.status(500).json({ message: "Failed to create leave record" });
    }
  });

  app.patch("/api/leaves/:id/return", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { returnDate, status } = req.body;

      const updated = await storage.updateLeaveRecord(id, {
        returnDate,
        status,
      });

      if (!updated) {
        return res.status(404).json({ message: "Leave record not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Update leave error:", error);
      res.status(500).json({ message: "Failed to update leave record" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const [totalStudents, presentToday, onLeaveToday, attendanceRate] = await Promise.all([
        storage.getTotalStudents(),
        storage.getPresentToday(),
        storage.getOnLeaveToday(),
        storage.getAttendanceRate(),
      ]);

      // Get top performers (students with >90% attendance)
      const topPerformersQuery = await db.execute(sql`
        SELECT 
          s.id,
          s.name,
          s.profile_image as "profileImage",
          ROUND(
            (COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
            NULLIF(COUNT(*), 0) * 100)::numeric, 
            1
          ) as "attendanceRate"
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        GROUP BY s.id, s.name, s.profile_image
        HAVING COUNT(*) > 0
        ORDER BY "attendanceRate" DESC
        LIMIT 5
      `);

      // Get low attendance students (<75% attendance)
      const lowAttendanceQuery = await db.execute(sql`
        SELECT 
          s.id,
          s.name,
          s.profile_image as "profileImage",
          ROUND(
            (COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
            NULLIF(COUNT(*), 0) * 100)::numeric, 
            1
          ) as "attendanceRate"
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        GROUP BY s.id, s.name, s.profile_image
        HAVING COUNT(*) > 0 AND 
          (COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
          NULLIF(COUNT(*), 0) * 100) < 75
        ORDER BY "attendanceRate" ASC
        LIMIT 5
      `);

      // Weekly trend (last 7 days)
      const weeklyTrendQuery = await db.execute(sql`
        SELECT 
          TO_CHAR(a.date, 'Dy') as day,
          COUNT(*) FILTER (WHERE a.status = 'present') as present,
          COUNT(*) FILTER (WHERE a.status = 'absent') as absent
        FROM attendance a
        WHERE a.date >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY a.date, TO_CHAR(a.date, 'Dy')
        ORDER BY a.date ASC
      `);

      // Monthly stats (last 6 months)
      const monthlyStatsQuery = await db.execute(sql`
        SELECT 
          TO_CHAR(a.date, 'Mon') as month,
          ROUND(
            (COUNT(*) FILTER (WHERE a.status = 'present')::numeric / 
            NULLIF(COUNT(*), 0) * 100)::numeric, 
            1
          ) as rate
        FROM attendance a
        WHERE a.date >= CURRENT_DATE - INTERVAL '5 months'
        GROUP BY TO_CHAR(a.date, 'Mon'), DATE_TRUNC('month', a.date)
        ORDER BY DATE_TRUNC('month', a.date) ASC
      `);

      res.json({
        totalStudents,
        presentToday,
        onLeaveToday,
        attendanceRate,
        topPerformers: topPerformersQuery.rows,
        lowAttendance: lowAttendanceQuery.rows,
        weeklyTrend: weeklyTrendQuery.rows,
        monthlyStats: monthlyStatsQuery.rows,
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
