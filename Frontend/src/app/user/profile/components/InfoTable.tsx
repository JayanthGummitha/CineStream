import { cn } from "@/lib/utils"

export interface InfoTableRow {
  label: string
  value: string | React.ReactNode
  icon?: React.ReactNode
}

interface InfoTableProps {
  rows: InfoTableRow[]
  className?: string
}

export function InfoTable({ rows, className }: InfoTableProps) {
  return (
    <div className={cn("overflow-hidden", className)} role="table" aria-label="Information table">
      {/* Table Body Rows - No header row */}
      {rows.map((row, index) => (
        <div 
          key={index}
          className={cn(
            "flex items-center py-4 px-6",
            "transition-all duration-200 ease-in-out",
            "hover:bg-muted/10",
            index !== rows.length - 1 && "border-b border-dotted border-border/60"
          )}
          role="row"
        >
          <div 
            className="w-[40%] text-sm text-muted-foreground font-normal flex items-center gap-3"
            role="rowheader"
          >
            {row.icon && (
              <span 
                aria-hidden="true" 
                className="transition-transform duration-200 ease-in-out opacity-60"
              >
                {row.icon}
              </span>
            )}
            {row.label}
          </div>
          <div 
            className="w-[60%] text-sm text-foreground font-normal"
            role="cell"
          >
            {row.value}
          </div>
        </div>
      ))}
    </div>
  )
}
