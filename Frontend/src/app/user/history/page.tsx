import { IconHistory } from "@tabler/icons-react"

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-purple-500/20">
          <IconHistory className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Watch History</h1>
          <p className="text-muted-foreground">
            Your viewing history
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">No watch history yet</p>
        </div>
      </div>
    </div>
  )
}
