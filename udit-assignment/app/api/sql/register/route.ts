import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.sqlUser.findUnique({
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
    const user = await prisma.sqlUser.create({
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
      database: "sql",
    })

    return NextResponse.json({ message: "Verification email sent" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
