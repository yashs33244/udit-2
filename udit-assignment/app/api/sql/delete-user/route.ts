import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendVerificationEmail } from "@/lib/email"

const prisma = new PrismaClient()

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    // Get current user
    const user = await prisma.sqlUser.findUnique({
      where: { id: Number(id) },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create deletion token
    const deletionToken = crypto.randomUUID()

    // Store deletion request
    await prisma.sqlDeletionRequest.create({
      data: {
        userId: Number(id),
        token: deletionToken,
      },
    })

    // Send verification email
    await sendVerificationEmail({
      email: user.email,
      token: deletionToken,
      type: "deletion",
      database: "sql",
    })

    return NextResponse.json({ message: "Verification email sent" }, { status: 200 })
  } catch (error) {
    console.error("Deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
