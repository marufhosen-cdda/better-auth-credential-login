"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface AuthContextType {
    user: any | null;
    session: any | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();

    return (
        <AuthContext.Provider
            value={{
                user: session?.user || null,
                session: session || null,
                isLoading: isPending,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};