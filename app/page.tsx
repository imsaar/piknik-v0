import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-primary-foreground">PIKNIK</h1>
          <p className="text-primary-foreground/80">The easiest way to organize your potluck events</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Organize Your Next Potluck Event</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create, manage, and share potluck events with friends and family. No more spreadsheets or group texts to
            keep track of who's bringing what!
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/create">Create a Potluck</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Create</CardTitle>
              <CardDescription>Set up your potluck event</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Create a potluck event with a name, date, and theme. Add items you need people to bring.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/create">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Share</CardTitle>
              <CardDescription>Invite your guests</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Share a unique link with your guests so they can sign up to bring items to your potluck.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Learn More
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage</CardTitle>
              <CardDescription>Keep track of everything</CardDescription>
            </CardHeader>
            <CardContent>
              <p>See who's bringing what, send reminders, and make changes as needed.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} PIKNIK. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

