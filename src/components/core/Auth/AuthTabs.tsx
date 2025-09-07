"use client";

import { useState } from "react";
import { SignUpForm } from "./SignUpForm";
import { SignInForm } from "./SigninForm";

type AuthMode = "signin" | "signup";

interface AuthTabsProps {
    initialMode?: AuthMode;
}

export function AuthTabs({ initialMode = "signin" }: AuthTabsProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);

    const toggleMode = () => {
        setMode(current => current === "signin" ? "signup" : "signin");
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {mode === "signin" ? (
                <SignInForm onToggleMode={toggleMode} />
            ) : (
                <SignUpForm onToggleMode={toggleMode} />
            )}
        </div>
    );
}