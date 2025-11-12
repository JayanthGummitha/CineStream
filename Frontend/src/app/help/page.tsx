import { IconHelp, IconSearch } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function HelpPage() {
  const helpTopics = [
    {
      title: "Getting Started",
      description: "Learn the basics of using CineStream",
      articles: 12,
    },
    {
      title: "Account & Billing",
      description: "Manage your subscription and payments",
      articles: 8,
    },
    {
      title: "Playback Issues",
      description: "Troubleshoot video playback problems",
      articles: 15,
    },
    {
      title: "Content & Features",
      description: "Discover what's available on CineStream",
      articles: 10,
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-blue-500/20">
          <IconHelp className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers and get support
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
        {helpTopics.map((topic) => (
          <Card key={topic.title} className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
              <CardDescription>{topic.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {topic.articles} articles
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            Contact our support team for personalized assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Email: support@cinestream.com
          </p>
          <p className="text-sm text-muted-foreground">
            Available 24/7
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
