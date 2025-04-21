import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerificationSentPage() {
  return (
    <div className="container mx-auto flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verification Email Sent</CardTitle>
          <CardDescription>Please check your email to verify your account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            We have sent a verification email to your inbox. Please click the link in the email to verify your account.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
