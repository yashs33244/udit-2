import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatabaseComparison } from "@/components/database-comparison"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-4xl font-bold">SQL vs NoSQL Database Operations</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SQL Database (PostgreSQL)</CardTitle>
            <CardDescription>Relational database with structured schema</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>
              PostgreSQL is a powerful, open-source object-relational database system with over 35 years of active
              development.
            </p>
            <Link href="/sql/register">
              <Button className="w-full">SQL User Management</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NoSQL Database (MongoDB)</CardTitle>
            <CardDescription>Document-oriented database with flexible schema</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>
              MongoDB is a document database with the scalability and flexibility that you want with the querying and
              indexing that you need.
            </p>
            <Link href="/nosql/register">
              <Button className="w-full">NoSQL User Management</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <DatabaseComparison />
      </div>
    </div>
  )
}
