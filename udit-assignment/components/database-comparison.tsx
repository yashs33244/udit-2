import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DatabaseComparison() {
  const comparisonData = [
    {
      parameter: "Data Structure/Schema",
      sql: "Rigid, predefined schema with tables, rows, and columns. Requires schema migration for changes.",
      nosql: "Flexible, schema-less design. Documents can have different fields within the same collection.",
    },
    {
      parameter: "Query Language",
      sql: "Standardized SQL language with powerful JOIN operations and complex queries.",
      nosql: "Database-specific query methods. MongoDB uses JSON-like query language.",
    },
    {
      parameter: "Scalability",
      sql: "Primarily vertical scaling (upgrading hardware). Horizontal scaling is more complex.",
      nosql: "Designed for horizontal scaling (adding more servers). Better for distributed architectures.",
    },
    {
      parameter: "ACID Compliance",
      sql: "Fully ACID compliant (Atomicity, Consistency, Isolation, Durability).",
      nosql:
        "Often sacrifices ACID properties for performance and scalability. MongoDB supports ACID transactions since v4.0.",
    },
    {
      parameter: "Performance",
      sql: "Optimized for complex queries and joins. May be slower for large-scale operations.",
      nosql: "Optimized for high throughput and simple queries. Faster for large volumes of data.",
    },
    {
      parameter: "Flexibility",
      sql: "Less flexible with changes. Schema modifications can be complex.",
      nosql: "Highly flexible. Easy to adapt to changing requirements.",
    },
    {
      parameter: "Use Cases",
      sql: "Financial systems, CRM, ERP, applications requiring complex transactions.",
      nosql: "Content management, real-time analytics, IoT, applications with rapidly changing data.",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>SQL vs NoSQL: 7-Parameter Comparison</CardTitle>
        <CardDescription>
          Understanding the key differences between relational and non-relational databases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Parameter</TableHead>
              <TableHead>SQL (PostgreSQL)</TableHead>
              <TableHead>NoSQL (MongoDB)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonData.map((item) => (
              <TableRow key={item.parameter}>
                <TableCell className="font-medium">{item.parameter}</TableCell>
                <TableCell>{item.sql}</TableCell>
                <TableCell>{item.nosql}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
