import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return NextResponse.json({ error: "No session" }, { status: 401 });
        }

        const userWithRole = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                Role: true,
            },
        });

        return NextResponse.json({
            ...session,
            user: {
                ...session.user,
                role: userWithRole?.Role,
            },
        });
    } catch (error) {
        console.error("Session check error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}