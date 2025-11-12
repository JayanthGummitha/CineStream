import { cn } from "@/lib/utils"
import { AppSidebar } from "./components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
      <main
        className={cn(
          "ml-auto w-full max-w-full",
          "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
          "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
          "sm:transition-[width] sm:duration-200 sm:ease-linear",
          "flex h-svh flex-col",
          "group-data-[scroll-locked=1]/body:h-full",
          "has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh",
        )}
      >
        <header className="flex h-16 md:h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="scale-125 sm:scale-100" />
          <div className="flex-1 flex items-center" id="breadcrumb" />
          {/* <LocalesMenuButton />
          <ThemeModeToggle />
          <RefreshButton />
          <UserMenu /> */}
        </header>
        
       <SidebarInset className="flex-1">
           {children}
       </SidebarInset>
      </main>
      {/* <Notification /> */}
      </div>
    </SidebarProvider>


    // <SidebarProvider>
    //   <AppSidebar />
    //   <main
    //     className={cn(
    //       "ml-auto w-full max-w-full",
    //       "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
    //       "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
    //       "sm:transition-[width] sm:duration-200 sm:ease-linear",
    //       "flex h-svh flex-col",
    //       "group-data-[scroll-locked=1]/body:h-full",
    //       "has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh",
    //     )}
    //   >
    //     <header className="flex h-16 md:h-12 shrink-0 items-center gap-2 px-4">
    //       <SidebarTrigger className="scale-125 sm:scale-100" />
    //       <div className="flex-1 flex items-center" id="breadcrumb" />
    //       {/* <LocalesMenuButton />
    //       <ThemeModeToggle />
    //       <RefreshButton />
    //       <UserMenu /> */}
    //     </header>
    //     {/* <ErrorBoundary
    //       onError={handleError}
    //       fallbackRender={({ error, resetErrorBoundary }) => (
    //         <Error
    //           error={error}
    //           errorInfo={errorInfo}
    //           resetErrorBoundary={resetErrorBoundary}
    //         />
    //       )}
    //     >
    //       <Suspense fallback={<Loading />}>
    //         <div className="flex flex-1 flex-col px-4 ">{props.children}</div>
    //       </Suspense>
    //     </ErrorBoundary> */}
    //   </main>
    //   {/* <Notification /> */}
    //    <SidebarInset className="flex-1">
    //        {children}
    //    </SidebarInset>
    // </SidebarProvider>
  )
}
