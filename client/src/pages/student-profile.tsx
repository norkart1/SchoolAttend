import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { ArrowBack, Phone, CalendarMonth, Schedule, Edit } from "@mui/icons-material";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Student, Attendance, LeaveRecord } from "@shared/schema";

export default function StudentProfile() {
  const { id } = useParams();
  const [, navigate] = useLocation();

  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: ["/api/students", id],
  });

  const { data: attendanceRecords, isLoading: isLoadingAttendance } = useQuery<Attendance[]>({
    queryKey: ["/api/students", id, "attendance"],
  });

  const { data: leaveRecords, isLoading: isLoadingLeaves } = useQuery<LeaveRecord[]>({
    queryKey: ["/api/students", id, "leaves"],
  });

  if (isLoadingStudent) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">Student not found</p>
            <Button onClick={() => navigate("/students")} className="mt-4">
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDays = attendanceRecords?.length || 0;
  const presentDays = attendanceRecords?.filter((r) => r.status === "present").length || 0;
  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/students")}
          data-testid="button-back"
        >
          <ArrowBack sx={{ fontSize: 20 }} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold">Student Profile</h1>
          <p className="text-muted-foreground mt-1">
            View detailed student information and attendance
          </p>
        </div>
        <Link href={`/students/${id}/edit`}>
          <Button variant="outline" data-testid="button-edit-student">
            <Edit sx={{ fontSize: 16, marginRight: '8px' }} />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={student.profileImage || undefined} />
                <AvatarFallback className="text-3xl">
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold mb-2">{student.name}</h2>

              <div className="w-full space-y-4 mt-6 text-left">
                <div className="flex items-start gap-3">
                  <Phone sx={{ fontSize: 20 }} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{student.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                  <p className="text-3xl font-bold text-chart-1">
                    {attendanceRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Days Present</p>
                  <p className="text-3xl font-bold text-chart-2">{presentDays}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                  <p className="text-3xl font-bold">{totalDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance" data-testid="tab-attendance">
                Attendance History
              </TabsTrigger>
              <TabsTrigger value="leaves" data-testid="tab-leaves">
                Leave Records
              </TabsTrigger>
            </TabsList>
            <TabsContent value="attendance" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {isLoadingAttendance ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : !attendanceRecords || attendanceRecords.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No attendance records found
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {attendanceRecords
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                            data-testid={`attendance-record-${record.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <CalendarMonth sx={{ fontSize: 16 }} className="text-muted-foreground" />
                              <span className="font-medium">
                                {format(new Date(record.date), "MMM dd, yyyy")}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={
                                record.status === "present"
                                  ? "bg-chart-2/10 text-chart-2"
                                  : record.status === "absent"
                                  ? "bg-chart-5/10 text-chart-5"
                                  : "bg-chart-3/10 text-chart-3"
                              }
                            >
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="leaves" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {isLoadingLeaves ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : !leaveRecords || leaveRecords.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No leave records found
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {leaveRecords
                        .sort((a, b) => new Date(b.leaveDate).getTime() - new Date(a.leaveDate).getTime())
                        .map((record) => (
                          <div
                            key={record.id}
                            className="p-4 rounded-lg border"
                            data-testid={`leave-record-${record.id}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Schedule sx={{ fontSize: 16 }} className="text-muted-foreground" />
                                <span className="font-medium">
                                  {format(new Date(record.leaveDate), "MMM dd, yyyy h:mm a")}
                                </span>
                              </div>
                              <Badge
                                variant="secondary"
                                className={
                                  record.status === "returned"
                                    ? "bg-chart-2/10 text-chart-2"
                                    : "bg-chart-3/10 text-chart-3"
                                }
                              >
                                {record.status === "returned" ? "Returned" : "On Leave"}
                              </Badge>
                            </div>
                            {record.returnDate && (
                              <p className="text-sm text-muted-foreground mb-2">
                                Returned: {format(new Date(record.returnDate), "MMM dd, yyyy h:mm a")}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">{record.leaveReason}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
