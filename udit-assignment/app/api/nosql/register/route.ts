import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { sendVerificationEmail } from "@/lib/email"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.nosqlUser.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create verification token
    const verificationToken = crypto.randomUUID()

    // Create user (not verified yet)
    const user = await prisma.nosqlUser.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationToken,
        verified: false,
      },
    })

    // Send verification email
    await sendVerificationEmail({
      email,
      token: verificationToken,
      type: "verification",
      database: "nosql",
    })

    return NextResponse.json({ message: "Verification email sent" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
