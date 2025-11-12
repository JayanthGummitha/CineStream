import { SectionCards } from "./components/section-cards"
import { ChartAreaInteractive } from "./components/chart-area-interactive"

export default function UserPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div >
        <h1 className="text-3xl font-bold mb-2">Overview</h1>
        <p className="text-muted-foreground">
          Your CineStream activity at a glance
        </p>
      </div>

      <SectionCards />

      <div className="mt-4">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}
