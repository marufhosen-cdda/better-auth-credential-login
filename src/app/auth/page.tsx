"use client";

import { AuthTabs } from "@/components/core/Auth/AuthTabs";
import { Suspense } from "react";

function AuthPageContent() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your account or create a new one
                    </p>
                </div>
                <AuthTabs />
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthPageContent />
        </Suspense>
    );
}