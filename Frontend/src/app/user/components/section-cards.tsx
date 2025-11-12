'use client';

import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useMyList } from "@/hooks/useMyList"
import { useWatchProgressList } from "@/hooks/useWatchProgressList"

export function SectionCards() {
  const { myList } = useMyList();
  const { progressList } = useWatchProgressList();
  
  // Calculate total time watched from progress data (all time since account creation)
  const totalSecondsWatched = progressList.reduce((total, item) => {
    return total + item.currentTime;
  }, 0);
  
  // Format time as hours, minutes, seconds
  const hours = Math.floor(totalSecondsWatched / 3600);
  const minutes = Math.floor((totalSecondsWatched % 3600) / 60);
  const seconds = Math.floor(totalSecondsWatched % 60);
  
  // Create display string
  const timeWatchedDisplay = hours > 0 
    ? `${hours}h ${minutes}m`
    : minutes > 0 
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`;
  
  // Calculate recent additions (items added in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentAdditions = progressList.filter(
    (item) => new Date(item.lastWatchedAt) >= sevenDaysAgo
  ).length;
  
  // Calculate percentage increase (based on recent activity)
  const percentageIncrease = progressList.length > 0 
    ? Math.min(Math.round((recentAdditions / progressList.length) * 100), 99)
    : 0;
  return (
    <div className="grid grid-cols-2 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="">
        <CardHeader>
          <CardDescription>Total Watch Time</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {timeWatchedDisplay}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-red-500/50 text-red-400">
              <IconTrendingUp />
              +{percentageIncrease}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totalSecondsWatched > 0 ? 'Since account creation' : 'Start watching'} <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {totalSecondsWatched > 0 ? 'Your total viewing time' : 'Your watch time will appear here'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50 shadow-lg border-1">
        <CardHeader>
          <CardDescription>Favorites</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {myList.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-orange-500/50 text-orange-400">
              <IconTrendingUp />
              +{myList.length > 0 ? Math.min(5, myList.length) : 0}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {myList.length > 0 ? 'Your saved movies' : 'Start adding favorites'} <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {myList.length > 0 ? 'Your collection is growing' : 'Save movies to your list'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50 shadow-lg border-1">
        <CardHeader>
          <CardDescription>Continue Watching</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {progressList.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
              <IconTrendingUp />
              +{recentAdditions}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {progressList.length > 0 ? 'In progress shows' : 'Start watching'} <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {progressList.length > 0 ? 'Pick up where you left off' : 'Your progress will appear here'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50 shadow-lg border-1">
        <CardHeader>
          <CardDescription>Watch Streak</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12 days
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-blue-500/50 text-blue-400">
              <IconTrendingUp />
              +12
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Keep the streak going <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Daily viewing milestone</div>
        </CardFooter>
      </Card>
    </div>
  )
}
