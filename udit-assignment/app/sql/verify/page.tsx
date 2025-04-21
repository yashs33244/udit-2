"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }

    const verifyAccount = async () => {
      try {
        const response = await fetch(`/api/sql/verify?token=${token}`, {
          method: "GET",
        })

        if (response.ok) {
          setStatus("success")
        } else {
          setStatus("error")
        }
      } catch (error) {
        setStatus("error")
      }
    }

    verifyAccount()
  }, [token])

  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === "loading" && "Verifying Account..."}
            {status === "success" && "Account Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Please wait while we verify your account."}
            {status === "success" && "Your account has been successfully verified."}
            {status === "error" && "We couldn't verify your account. The link may be invalid or expired."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status !== "loading" && (
            <Link href={status === "success" ? "/sql/login" : "/"}>
              <Button>{status === "success" ? "Go to Login" : "Return to Home"}</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
