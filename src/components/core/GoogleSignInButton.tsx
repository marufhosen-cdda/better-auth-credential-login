"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SocialAuthButtonProps {
    provider: "google";
    children: React.ReactNode;
    className?: string;
}

export function SocialAuthButton({ provider, children, className }: SocialAuthButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSocialAuth = async () => {
        setIsLoading(true);

        try {
            await signIn.social({
                provider,
                callbackURL: "/dashboard",
            });
        } catch (error) {
            console.error(`${provider} sign-in error:`, error);
            setIsLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={handleSocialAuth}
            disabled={isLoading}
            className={className}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </Button>
    );
}