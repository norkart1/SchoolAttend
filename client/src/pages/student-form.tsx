import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowBack, CloudUpload, Close } from "@mui/icons-material";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { insertStudentSchema, type Student, type InsertStudent } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function StudentForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!id;

  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: ["/api/students", id],
    enabled: isEditing,
  });

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      profileImage: "",
    },
    values: student
      ? {
          name: student.name,
          profileImage: student.profileImage || "",
        }
      : undefined,
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      return await apiRequest("POST", "/api/students", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Success",
        description: "Student created successfully",
      });
      navigate("/students");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create student",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      return await apiRequest("PATCH", `/api/students/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students", id] });
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
      navigate("/students");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update student",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(data: InsertStudent) {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      form.setValue("profileImage", base64);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("profileImage", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentImage = imagePreview || form.watch("profileImage");

  if (isEditing && isLoadingStudent) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div>
          <h1 className="text-3xl font-semibold">
            {isEditing ? "Edit Student" : "Add New Student"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update student information"
              : "Enter student details to create a new record"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-6">
                            <Avatar className="h-32 w-32">
                              <AvatarImage src={currentImage || undefined} />
                              <AvatarFallback className="text-2xl">
                                {form.watch("name")
                                  ? form
                                      .watch("name")
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex gap-2">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="profile-image-input"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  fileInputRef.current?.click()
                                }
                                data-testid="button-upload-image"
                              >
                                <CloudUpload sx={{ fontSize: 16, marginRight: '8px' }} />
                                Upload
                              </Button>
                              {currentImage && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={removeImage}
                                  data-testid="button-remove-image"
                                >
                                  <Close sx={{ fontSize: 16, marginRight: '8px' }} />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter student name"
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-student"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : isEditing
                    ? "Update Student"
                    : "Create Student"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/students")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
