import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { CalendarMonth, ChevronLeft, ChevronRight, Check, Close, Schedule } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Student, Attendance } from "@shared/schema";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { toast } = useToast();

  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: attendanceRecords } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance", format(selectedMonth, "yyyy-MM")],
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: number; status: "present" | "absent" | "leave" }) => {
      return await apiRequest("POST", "/api/attendance", {
        studentId,
        date: format(selectedDate, "yyyy-MM-dd"),
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
    },
  });

  const getAttendanceForStudent = (studentId: number, date: Date) => {
    return attendanceRecords?.find(
      (record) =>
        record.studentId === studentId &&
        isSameDay(new Date(record.date), date)
    );
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  });

  const handleMarkAttendance = (studentId: number, status: "present" | "absent" | "leave") => {
    markAttendanceMutation.mutate({ studentId, status });
  };

  if (isLoadingStudents) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold">Attendance Tracking</h1>
        <p className="text-muted-foreground mt-1">
          Mark and view student attendance records
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Mark Attendance</CardTitle>
              <div className="flex items-center gap-2">
                <CalendarMonth sx={{ fontSize: 16 }} className="text-muted-foreground" />
                <span className="font-mono text-sm">
                  {format(selectedDate, "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!students || students.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No students found. Add students to mark attendance.
                </p>
              ) : (
                students.map((student) => {
                  const attendance = getAttendanceForStudent(student.id, selectedDate);
                  return (
                    <div
                      key={student.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                      data-testid={`attendance-row-${student.id}`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.profileImage || undefined} />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.grade || "No grade"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={attendance?.status === "present" ? "default" : "outline"}
                          onClick={() => handleMarkAttendance(student.id, "present")}
                          disabled={markAttendanceMutation.isPending}
                          className={attendance?.status === "present" ? "bg-chart-2 hover:bg-chart-2" : ""}
                          data-testid={`button-present-${student.id}`}
                        >
                          <Check sx={{ fontSize: 16 }} />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance?.status === "absent" ? "default" : "outline"}
                          onClick={() => handleMarkAttendance(student.id, "absent")}
                          disabled={markAttendanceMutation.isPending}
                          className={attendance?.status === "absent" ? "bg-chart-5 hover:bg-chart-5" : ""}
                          data-testid={`button-absent-${student.id}`}
                        >
                          <Close sx={{ fontSize: 16 }} />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendance?.status === "leave" ? "default" : "outline"}
                          onClick={() => handleMarkAttendance(student.id, "leave")}
                          disabled={markAttendanceMutation.isPending}
                          className={attendance?.status === "leave" ? "bg-chart-3 hover:bg-chart-3" : ""}
                          data-testid={`button-leave-${student.id}`}
                        >
                          <Schedule sx={{ fontSize: 16 }} />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Monthly View</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(selectedMonth);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedMonth(newDate);
                  }}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft sx={{ fontSize: 16 }} />
                </Button>
                <span className="font-medium min-w-[120px] text-center">
                  {format(selectedMonth, "MMMM yyyy")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(selectedMonth);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedMonth(newDate);
                  }}
                  data-testid="button-next-month"
                >
                  <ChevronRight sx={{ fontSize: 16 }} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-sm font-medium text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOfMonth(selectedMonth).getDay() }).map(
                (_, i) => (
                  <div key={`empty-${i}`} />
                )
              )}
              {monthDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      p-2 text-sm rounded-md transition-colors
                      ${isSelected ? "bg-primary text-primary-foreground" : "hover-elevate"}
                      ${isToday && !isSelected ? "border-2 border-primary" : ""}
                    `}
                    data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium">Legend</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                  <Check sx={{ fontSize: 12, marginRight: '4px' }} />
                  Present
                </Badge>
                <Badge variant="secondary" className="bg-chart-5/10 text-chart-5">
                  <Close sx={{ fontSize: 12, marginRight: '4px' }} />
                  Absent
                </Badge>
                <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">
                  <Schedule sx={{ fontSize: 12, marginRight: '4px' }} />
                  Leave
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
