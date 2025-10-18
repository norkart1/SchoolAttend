import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Schedule, Add, CheckCircle, Person } from "@mui/icons-material";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertLeaveRecordSchema, type LeaveRecord, type Student } from "@shared/schema";
import { z } from "zod";

const leaveFormSchema = insertLeaveRecordSchema.extend({
  leaveDate: z.string().min(1, "Leave date is required"),
});

type LeaveFormData = z.infer<typeof leaveFormSchema>;

export default function LeavesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: students } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: leaveRecords, isLoading } = useQuery<(LeaveRecord & { student?: Student })[]>({
    queryKey: ["/api/leaves"],
  });

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      studentId: 0,
      leaveDate: "",
      leaveReason: "",
      returnDate: null,
      status: "on_leave",
    },
  });

  const createLeaveMutation = useMutation({
    mutationFn: async (data: LeaveFormData) => {
      return await apiRequest("POST", "/api/leaves", {
        ...data,
        leaveDate: new Date(data.leaveDate).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Leave record created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const markReturnMutation = useMutation({
    mutationFn: async (leaveId: number) => {
      return await apiRequest("PATCH", `/api/leaves/${leaveId}/return`, {
        returnDate: new Date().toISOString(),
        status: "returned",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaves"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Student marked as returned",
      });
    },
  });

  function onSubmit(data: LeaveFormData) {
    createLeaveMutation.mutate(data);
  }

  const onLeaveRecords = leaveRecords?.filter((r) => r.status === "on_leave") || [];
  const returnedRecords = leaveRecords?.filter((r) => r.status === "returned") || [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-20 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            Track student leave requests and returns
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-leave">
              <Add sx={{ fontSize: 16, marginRight: '8px' }} />
              Add Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Student Leave</DialogTitle>
              <DialogDescription>
                Add a new leave record for a student
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-student">
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students?.map((student) => (
                            <SelectItem
                              key={student.id}
                              value={student.id.toString()}
                            >
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leaveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leave Date & Time *</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          data-testid="input-leave-date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leaveReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter reason for leave"
                          rows={3}
                          data-testid="input-leave-reason"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={createLeaveMutation.isPending}
                  data-testid="button-submit-leave"
                >
                  {createLeaveMutation.isPending ? "Saving..." : "Record Leave"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Schedule sx={{ fontSize: 20 }} className="text-chart-3" />
              Currently On Leave ({onLeaveRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {onLeaveRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No students currently on leave
                </p>
              ) : (
                onLeaveRecords.map((record) => {
                  const student = students?.find((s) => s.id === record.studentId);
                  if (!student) return null;
                  return (
                    <div
                      key={record.id}
                      className="p-4 rounded-lg border bg-card"
                      data-testid={`leave-record-${record.id}`}
                    >
                      <div className="flex items-start gap-4">
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
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Left: {format(new Date(record.leaveDate), "MMM dd, yyyy h:mm a")}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {record.leaveReason}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            onClick={() => markReturnMutation.mutate(record.id)}
                            disabled={markReturnMutation.isPending}
                            data-testid={`button-mark-return-${record.id}`}
                          >
                            <CheckCircle sx={{ fontSize: 16, marginRight: '8px' }} />
                            Mark as Returned
                          </Button>
                        </div>
                        <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">
                          On Leave
                        </Badge>
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
            <CardTitle className="flex items-center gap-2">
              <CheckCircle sx={{ fontSize: 20 }} className="text-chart-2" />
              Recently Returned ({returnedRecords.slice(0, 10).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {returnedRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No return records yet
                </p>
              ) : (
                returnedRecords.slice(0, 10).map((record) => {
                  const student = students?.find((s) => s.id === record.studentId);
                  if (!student) return null;
                  return (
                    <div
                      key={record.id}
                      className="p-4 rounded-lg border bg-card"
                      data-testid={`return-record-${record.id}`}
                    >
                      <div className="flex items-start gap-4">
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
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Left: {format(new Date(record.leaveDate), "MMM dd, h:mm a")}
                          </p>
                          {record.returnDate && (
                            <p className="text-sm text-muted-foreground">
                              Returned: {format(new Date(record.returnDate), "MMM dd, h:mm a")}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {record.leaveReason}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                          Returned
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
