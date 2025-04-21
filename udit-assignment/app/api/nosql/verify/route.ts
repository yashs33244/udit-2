import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Find user with this verification token
    const user = await prisma.nosqlUser.findFirst({
      where: { verificationToken: token },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Update user to verified
    await prisma.nosqlUser.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null,
      },
    })

    return NextResponse.json({ message: "Account verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
