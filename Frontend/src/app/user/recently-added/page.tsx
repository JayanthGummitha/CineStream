import { IconClock } from "@tabler/icons-react"

export default function RecentlyAddedPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-green-500/20">
          <IconClock className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Recently Added</h1>
          <p className="text-muted-foreground">
            Latest content on CineStream
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted/50 aspect-[2/3] rounded-xl flex items-center justify-center"
          >
            <p className="text-muted-foreground">Content {i + 1}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
