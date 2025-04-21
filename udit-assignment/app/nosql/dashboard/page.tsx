"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

const updateFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const apiUrl =
  process.env.NEXT_PUBLIC_MONGODB_BE_URL || "http://localhost:5001";

export default function NoSQLDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [user, setUser] = useState<any>(null);

  const form = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("nosql-auth-token");

        if (!token) {
          // No token found, redirect to login
          router.push("/nosql/login");
          return;
        }

        const response = await fetch(`${apiUrl}/api/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid or expired, redirect to login
            localStorage.removeItem("nosql-auth-token");
            router.push("/nosql/login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser(userData);

        // Update form default values
        form.reset({
          username: userData.username,
          email: userData.email,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description:
            "Failed to fetch user data. Please try logging in again.",
          variant: "destructive",
        });
        router.push("/nosql/login");
      } finally {
        setIsFetching(false);
      }
    }

    fetchUserData();
  }, [router, form]);

  async function onUpdate(values: z.infer<typeof updateFormSchema>) {
    if (!user) return;

    setIsLoading(true);

    // Get token from localStorage
    const token = localStorage.getItem("nosql-auth-token");

    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token missing. Please log in again.",
        variant: "destructive",
      });
      router.push("/nosql/login");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/users/update-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newUsername: values.username,
          newEmail: values.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Update failed");
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your email to confirm your account update.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete() {
    if (!user) return;

    setIsLoading(true);

    // Get token from localStorage
    const token = localStorage.getItem("nosql-auth-token");

    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token missing. Please log in again.",
        variant: "destructive",
      });
      router.push("/nosql/login");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/users/delete-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete request failed");
      }

      toast({
        title: "Verification Email Sent",
        description: "Please check your email to confirm account deletion.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("nosql-auth-token");

    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });

    // Redirect to login page
    router.push("/nosql/login");
  };

  if (isFetching) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center flex-col">
        <p>Please log in to view your dashboard</p>
        <Link href="/nosql/login">
          <Button className="mt-4">Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">NoSQL Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="update">Update Account</TabsTrigger>
          <TabsTrigger value="delete">Delete Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Username
                  </p>
                  <p>{user.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Database
                  </p>
                  <p>MongoDB (NoSQL)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="update">
          <Card>
            <CardHeader>
              <CardTitle>Update Account</CardTitle>
              <CardDescription>
                Make changes to your account. A verification email will be sent
                before changes are applied.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onUpdate)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Sending verification..." : "Update Account"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delete">
          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Are you sure you want to delete your account? A verification
                email will be sent to confirm this action.
              </p>
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading}
              >
                {isLoading ? "Sending verification..." : "Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
