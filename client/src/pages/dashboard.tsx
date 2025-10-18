import { useQuery } from "@tanstack/react-query";
import {
  People,
  HowToReg,
  Schedule,
  TrendingUp,
  TrendingDown,
  EmojiEvents,
  Warning,
} from "@mui/icons-material";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  onLeaveToday: number;
  attendanceRate: number;
  topPerformers: Array<{
    id: number;
    name: string;
    profileImage: string | null;
    attendanceRate: number;
  }>;
  lowAttendance: Array<{
    id: number;
    name: string;
    profileImage: string | null;
    attendanceRate: number;
  }>;
  weeklyTrend: Array<{
    day: string;
    present: number;
    absent: number;
  }>;
  monthlyStats: Array<{
    month: string;
    rate: number;
  }>;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: People,
      color: "text-chart-1",
      testId: "stat-total-students",
    },
    {
      title: "Present Today",
      value: stats.presentToday,
      icon: HowToReg,
      color: "text-chart-2",
      testId: "stat-present-today",
    },
    {
      title: "On Leave",
      value: stats.onLeaveToday,
      icon: Schedule,
      color: "text-chart-3",
      testId: "stat-on-leave",
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-chart-1",
      testId: "stat-attendance-rate",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of attendance and student performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon sx={{ fontSize: 20 }} className={stat.color} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp sx={{ fontSize: 20 }} className="text-chart-1" />
              Weekly Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Present"
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="hsl(var(--chart-5))"
                  strokeWidth={2}
                  name="Absent"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="rate" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EmojiEvents sx={{ fontSize: 20 }} className="text-chart-2" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topPerformers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No data available yet
                </p>
              ) : (
                stats.topPerformers.map((student, index) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4"
                    data-testid={`top-performer-${student.id}`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chart-2/10 text-chart-2 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.profileImage || undefined} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Attendance: {student.attendanceRate.toFixed(1)}%
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                      {student.attendanceRate.toFixed(0)}%
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warning sx={{ fontSize: 20 }} className="text-chart-3" />
              Low Attendance Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.lowAttendance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  All students have good attendance
                </p>
              ) : (
                stats.lowAttendance.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-4"
                    data-testid={`low-attendance-${student.id}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.profileImage || undefined} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Attendance: {student.attendanceRate.toFixed(1)}%
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-chart-5/10 text-chart-5">
                      {student.attendanceRate.toFixed(0)}%
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
