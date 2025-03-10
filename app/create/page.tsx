import { CreatePotluckForm } from "@/components/create-potluck-form"

export default function CreatePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create a New Potluck</h1>
        <p className="text-muted-foreground mb-8">
          Fill out the form below to create your potluck event. You'll receive an admin link via email to manage your
          event after creation.
        </p>
        <CreatePotluckForm />
      </div>
    </div>
  )
}

