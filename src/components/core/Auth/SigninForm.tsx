"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface SignInFormProps {
    onToggleMode?: () => void;
}

export function SignInForm({ onToggleMode }: SignInFormProps) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }

        // Clear general error
        if (generalError) {
            setGeneralError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setGeneralError("");

        try {
            const { data, error } = await signIn.email({
                email: formData.email.trim(),
                password: formData.password,
            });

            if (error) {
                // Handle specific error types
                if (error.message?.includes("email") || error.message?.includes("user")) {
                    setErrors({ email: "Email not found" });
                } else if (error.message?.includes("password") || error.message?.includes("credentials")) {
                    setErrors({ password: "Incorrect password" });
                } else {
                    setGeneralError(error.message || "Failed to sign in");
                }
                return;
            }

            if (data?.user) {
                // Success - redirect to intended page or dashboard
                const redirectTo = searchParams.get("redirect") || "/dashboard";
                router.push(redirectTo);
                router.refresh();
            }
        } catch (err) {
            console.error("Signin error:", err);
            setGeneralError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                    Enter your credentials to sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {generalError && (
                        <Alert variant="destructive">
                            <AlertDescription>{generalError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange("email")}
                            placeholder="Enter your email"
                            disabled={isLoading}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange("password")}
                            placeholder="Enter your password"
                            disabled={isLoading}
                            className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <span>
                            Sign In
                        </span>
                    </Button>
                </form>

                {onToggleMode && (
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Dont have an account?{" "}
                            <button
                                type="button"
                                onClick={onToggleMode}
                                className="text-blue-600 hover:underline font-medium"
                            >
                                Create account
                            </button>
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}