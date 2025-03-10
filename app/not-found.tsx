import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold mt-2">Page Not Found</h2>
        <p className="mt-4 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <Button asChild className="mt-6">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}

