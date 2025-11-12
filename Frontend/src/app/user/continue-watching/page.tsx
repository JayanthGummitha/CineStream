import { IconPlayerPlay } from "@tabler/icons-react"

export default function ContinueWatchingPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-blue-500/20">
          <IconPlayerPlay className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Continue Watching</h1>
          <p className="text-muted-foreground">
            Pick up where you left off
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">No items to continue watching</p>
        </div>
      </div>
    </div>
  )
}
