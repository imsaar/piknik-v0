"use client"

import { useState, useEffect } from "react"
import { Copy, Mail, MessageSquare, RefreshCw, Settings, Trash2, Plus } from "lucide-react"
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
import type { Potluck, Participant, PotluckItem } from "@/lib/types"
import { updateNotificationSettings, messageParticipant, addPotluckItem, updatePotluckItem, removePotluckItem } from "@/lib/actions"

interface AdminDashboardProps {
  potluck: Potluck
}

export function AdminDashboard({ potluck }: AdminDashboardProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(potluck.notificationsEnabled)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [messageText, setMessageText] = useState("")
  const [participantUrl, setParticipantUrl] = useState("")
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false)
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PotluckItem | null>(null)
  const [itemName, setItemName] = useState("")
  const [itemQuantity, setItemQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Set the participant URL after component mounts to avoid window is not defined error
  useEffect(() => {
    // Use eventCode instead of id for the participant URL
    setParticipantUrl(`${window.location.origin}/potluck/${potluck.eventCode}`)
  }, [potluck.eventCode])

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
      // Get the admin token from the URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const adminToken = urlParams.get('token') || potluck.adminToken;
      
      if (!adminToken) {
        throw new Error('Admin token not found');
      }
      
      // Use eventCode and adminToken instead of id
      await updateNotificationSettings(potluck.eventCode, adminToken, checked)
      
      toast({
        title: "Settings updated",
        description: `Email notifications ${checked ? "enabled" : "disabled"}.`,
      })
    } catch (error) {
      console.error('Error updating notification settings:', error);
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
      // Get the admin token from the URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const adminToken = urlParams.get('token') || potluck.adminToken;
      
      if (!adminToken) {
        throw new Error('Admin token not found');
      }
      
      // Use eventCode, adminToken, and participant's token
      await messageParticipant(potluck.eventCode, adminToken, selectedParticipant.token || selectedParticipant.id, messageText)
      
      toast({
        title: "Message sent",
        description: "Your message has been sent to the participant.",
      })
      setMessageDialogOpen(false)
      setMessageText("")
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openAddItemDialog = () => {
    setItemName("")
    setItemQuantity(1)
    setAddItemDialogOpen(true)
  }

  const openEditItemDialog = (item: PotluckItem) => {
    setSelectedItem(item)
    setItemName(item.name)
    setItemQuantity(item.quantity)
    setEditItemDialogOpen(true)
  }

  const handleAddItem = async () => {
    if (!itemName.trim() || itemQuantity < 1) return

    try {
      setIsProcessing(true)
      // Get the admin token from the URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const adminToken = urlParams.get('token') || potluck.adminToken;
      
      if (!adminToken) {
        throw new Error('Admin token not found');
      }
      
      const result = await addPotluckItem(potluck.eventCode, adminToken, {
        name: itemName,
        quantity: itemQuantity
      })
      
      if (result.success) {
        toast({
          title: "Item added",
          description: "The item has been added to your potluck.",
        })
        setAddItemDialogOpen(false)
      } else {
        throw new Error('Failed to add item')
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add the item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateItem = async () => {
    if (!selectedItem || !itemName.trim() || itemQuantity < 1) return

    try {
      setIsProcessing(true)
      // Get the admin token from the URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const adminToken = urlParams.get('token') || potluck.adminToken;
      
      if (!adminToken) {
        throw new Error('Admin token not found');
      }
      
      const success = await updatePotluckItem(potluck.eventCode, adminToken, selectedItem.id, {
        name: itemName,
        quantity: itemQuantity
      })
      
      if (success) {
        toast({
          title: "Item updated",
          description: "The item has been updated successfully.",
        })
        setEditItemDialogOpen(false)
      } else {
        throw new Error('Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update the item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveItem = async (item: PotluckItem) => {
    if (!confirm(`Are you sure you want to remove "${item.name}"? This will also remove all signups for this item.`)) {
      return
    }

    try {
      // Get the admin token from the URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const adminToken = urlParams.get('token') || potluck.adminToken;
      
      if (!adminToken) {
        throw new Error('Admin token not found');
      }
      
      const success = await removePotluckItem(potluck.eventCode, adminToken, item.id)
      
      if (success) {
        toast({
          title: "Item removed",
          description: "The item has been removed from your potluck.",
        })
      } else {
        throw new Error('Failed to remove item')
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove the item. Please try again.",
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Items Needed</CardTitle>
                  <CardDescription>Track the items needed for your potluck and who's bringing them.</CardDescription>
                </div>
                <Button onClick={openAddItemDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {potluck.items.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No items added yet. Add your first item to get started.</p>
                ) : (
                  potluck.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.signups.length} of {item.quantity} claimed
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditItemDialog(item)}>
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Update
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRemoveItem(item)}>
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
                  ))
                )}
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

      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>
              Add a new item to your potluck for participants to sign up for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="e.g., Pasta Salad"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-quantity">Quantity Needed</Label>
              <Input
                id="item-quantity"
                type="number"
                min="1"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground">
                How many of this item do you need for your potluck?
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={isProcessing}>
              {isProcessing ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editItemDialogOpen} onOpenChange={setEditItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Item</DialogTitle>
            <DialogDescription>
              Update the details of this potluck item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-name">Item Name</Label>
              <Input
                id="edit-item-name"
                placeholder="e.g., Pasta Salad"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-quantity">Quantity Needed</Label>
              <Input
                id="edit-item-quantity"
                type="number"
                min="1"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground">
                How many of this item do you need for your potluck?
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItemDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem} disabled={isProcessing}>
              {isProcessing ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

