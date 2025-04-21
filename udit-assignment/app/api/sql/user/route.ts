import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // In a real application, you would use a JWT or session to authenticate
    // For this demo, we'll check for a simple cookie that might be set at login
    const cookieStore = cookies()
    const userId = cookieStore.get("sql-user-id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Find user
    const user = await prisma.sqlUser.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        verified: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: "User data retrieved successfully",
        user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("User data retrieval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 