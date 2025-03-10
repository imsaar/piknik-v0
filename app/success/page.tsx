"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const [participantUrl, setParticipantUrl] = useState("")
  const [adminUrl, setAdminUrl] = useState("")

  useEffect(() => {
    const id = searchParams.get("id")
    const adminId = searchParams.get("adminId")
    const baseUrl = window.location.origin

    if (id) {
      setParticipantUrl(`${baseUrl}/potluck/${id}`)
    }
    if (adminId) {
      setAdminUrl(`${baseUrl}/admin/${adminId}`)
    }
  }, [searchParams])

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied!",
      description: "The link has been copied to your clipboard.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Potluck Created!</CardTitle>
            <CardDescription>Your potluck event has been successfully created.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="participant-link">Participant Link</Label>
              <div className="flex gap-2">
                <Input
                  id="participant-link"
                  value={participantUrl}
                  readOnly
                  onClick={(e) => e.currentTarget.select()}
                />
                <Button variant="outline" onClick={() => handleCopyLink(participantUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with your guests so they can sign up to bring items.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-link">Admin Link</Label>
              <div className="flex gap-2">
                <Input id="admin-link" value={adminUrl} readOnly onClick={(e) => e.currentTarget.select()} />
                <Button variant="outline" onClick={() => handleCopyLink(adminUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use this link to manage your potluck event. Keep it safe and don't share it with others.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

