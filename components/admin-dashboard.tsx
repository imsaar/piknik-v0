"use client"

import { useState, useEffect } from "react"
import { Copy, Mail, MessageSquare, RefreshCw, Settings, Trash2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { Potluck, Participant } from "@/lib/types"
import { updateNotificationSettings, messageParticipant } from "@/lib/actions"

interface AdminDashboardProps {
  potluck: Potluck
}

export function AdminDashboard({ potluck }: AdminDashboardProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(potluck.notificationsEnabled)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [messageText, setMessageText] = useState("")
  const [participantUrl, setParticipantUrl] = useState("")

  // Set the participant URL after component mounts to avoid window is not defined error
  useEffect(() => {
    setParticipantUrl(`${window.location.origin}/potluck/${potluck.id}`)
  }, [potluck.id])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(participantUrl)
    toast({
      title: "Link copied!",
      description: "The participant link has been copied to your clipboard.",
    })
  }

  const handleNotificationToggle = async (checked: boolean) => {
    setNotificationsEnabled(checked)
    try {
      await updateNotificationSettings(potluck.id, checked)
      toast({
        title: "Settings updated",
        description: `Email notifications ${checked ? "enabled" : "disabled"}.`,
      })
    } catch (error) {
      setNotificationsEnabled(!checked) // Revert on error
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      })
    }
  }

  const openMessageDialog = (participant: Participant) => {
    setSelectedParticipant(participant)
    setMessageDialogOpen(true)
  }

  const handleSendMessage = async () => {
    if (!selectedParticipant || !messageText.trim()) return

    try {
      await messageParticipant(potluck.id, selectedParticipant.id, messageText)
      toast({
        title: "Message sent",
        description: `Your message has been sent to ${selectedParticipant.name || selectedParticipant.email}.`,
      })
      setMessageDialogOpen(false)
      setMessageText("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{potluck.name}</h1>
          <p className="text-muted-foreground">
            {format(new Date(potluck.date), "EEEE, MMMM d, yyyy")}
            {potluck.theme && ` • ${potluck.theme} Theme`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Participant Link
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
        </div>
      </div>

      <Tabs defaultValue="items">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Items Needed</CardTitle>
              <CardDescription>Track the items needed for your potluck and who's bringing them.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {potluck.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.signups.length} of {item.quantity} claimed
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Update
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="mr-2 h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {item.signups.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Participants</h4>
                        <div className="space-y-2">
                          {item.signups.map((signup) => (
                            <div key={signup.id} className="flex items-center justify-between text-sm">
                              <span>
                                {signup.participant.name || signup.participant.email}
                                {signup.quantity > 1 && ` (${signup.quantity})`}
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => openMessageDialog(signup.participant)}>
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Message
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
              <CardDescription>People who have signed up to bring items to your potluck.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {potluck.participants.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No participants have signed up yet.</p>
                ) : (
                  potluck.participants.map((participant) => (
                    <div key={participant.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{participant.name || participant.email}</h3>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openMessageDialog(participant)}>
                            <Mail className="mr-2 h-3 w-3" />
                            Send Email
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Bringing</h4>
                        <div className="flex flex-wrap gap-2">
                          {participant.signups.map((signup) => (
                            <Badge key={signup.id} variant="outline">
                              {signup.item.name} {signup.quantity > 1 && `(${signup.quantity})`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Settings</CardTitle>
              <CardDescription>Manage your potluck event settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications when participants sign up or make changes.
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={handleNotificationToggle}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sharing</h3>
                <div className="space-y-2">
                  <Label htmlFor="participant-link">Participant Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="participant-link"
                      value={participantUrl}
                      readOnly
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <Button variant="outline" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share this link with your guests so they can sign up to bring items.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <div className="border border-destructive/20 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-destructive">Delete Event</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this potluck event and all associated data.
                      </p>
                    </div>
                    <Button variant="destructive">Delete Event</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send an email message to {selectedParticipant?.name || selectedParticipant?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

