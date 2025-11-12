import { SectionCards } from "../components/section-cards"
import { ChartAreaInteractive } from "../components/chart-area-interactive"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your CineStream dashboard
        </p>
      </div>

      <SectionCards />

      <div className="mt-4">
        <ChartAreaInteractive />
      </div>
    </div>
  )
}
