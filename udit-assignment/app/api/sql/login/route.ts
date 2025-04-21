import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Check if user exists
    const user = await prisma.sqlUser.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
    }

    // Check if user is verified
    if (!user.verified) {
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 400 })
    }

    // Check password
    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
    }

    // Create session token
    const secret = process.env.JWT_SECRET || "your_jwt_secret_key"

    const token = sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        database: "sql",
      },
      secret,
      { expiresIn: "1d" }
    )

    // Set cookie
    cookies().set({
      name: "sqlAuth",
      value: token,
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + 86400000), // 1 day
    })

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
