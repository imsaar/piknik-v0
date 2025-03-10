"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarDays, MapPin } from "lucide-react"

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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "@/components/ui/use-toast"
import type { Potluck, PotluckItem } from "@/lib/types"
import { signUpForItem } from "@/lib/actions"

interface ParticipantViewProps {
  potluck: Potluck
}

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().optional(),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
})

type SignupFormValues = z.infer<typeof signupSchema>

export function ParticipantView({ potluck }: ParticipantViewProps) {
  const [selectedItem, setSelectedItem] = useState<PotluckItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [maxQuantity, setMaxQuantity] = useState(1)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      name: "",
      quantity: 1,
    },
  })

  // Update max quantity when selected item changes
  useEffect(() => {
    if (selectedItem) {
      const availableQty = getAvailableQuantity(selectedItem)
      setMaxQuantity(availableQty)

      // Reset quantity if current value is greater than available
      const currentQty = form.getValues("quantity")
      if (currentQty > availableQty) {
        form.setValue("quantity", availableQty)
      }
    }
  }, [selectedItem, form])

  const handleSignup = (item: PotluckItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const onSubmit = async (values: SignupFormValues) => {
    if (!selectedItem) return

    setIsSubmitting(true)
    try {
      await signUpForItem({
        potluckId: potluck.id,
        itemId: selectedItem.id,
        email: values.email,
        name: values.name,
        quantity: values.quantity,
      })

      toast({
        title: "Sign up successful!",
        description: "You'll receive a confirmation email shortly.",
      })
      setIsDialogOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem signing up. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAvailableQuantity = (item: PotluckItem) => {
    const claimed = item.signups.reduce((total, signup) => total + signup.quantity, 0)
    return Math.max(0, item.quantity - claimed)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{potluck.name}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground">
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-4 w-4" />
            {format(new Date(potluck.date), "EEEE, MMMM d, yyyy")}
          </div>
          {potluck.location && (
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              {potluck.location}
            </div>
          )}
        </div>
        {potluck.theme && (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {potluck.theme} Theme
            </span>
          </div>
        )}
        {potluck.description && <p className="mt-4 text-muted-foreground">{potluck.description}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items Needed</CardTitle>
          <CardDescription>Sign up to bring an item to the potluck.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {potluck.items.map((item) => {
              const availableQuantity = getAvailableQuantity(item)
              const isFilled = availableQuantity === 0

              return (
                <Card key={item.id} className={isFilled ? "bg-muted" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        {item.signups.length > 0 ? (
                          <>
                            <span className="font-medium">{item.quantity - availableQuantity}</span> of{" "}
                            <span className="font-medium">{item.quantity}</span> claimed
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{item.quantity}</span> needed
                          </>
                        )}
                      </p>
                      <Button
                        className="w-full"
                        variant={isFilled ? "outline" : "default"}
                        disabled={isFilled}
                        onClick={() => handleSignup(item)}
                      >
                        {isFilled ? "Filled" : "Sign Up"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up for {selectedItem?.name}</DialogTitle>
            <DialogDescription>Enter your information to sign up for this item.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={maxQuantity} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Signing Up..." : "Sign Up"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

