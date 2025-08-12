import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="eventtitle">Title</Label>
              <Input
                id="title"
                type="text"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startdatetime">Start</Label>
              <Input
                id="start"
                type="datetime-local"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="enddatetime">End</Label>
              <Input
                id="end"
                type="datetime-local"
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
