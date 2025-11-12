import { Film, Search, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type?: 'no-results' | 'no-connection' | 'no-content';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  type = 'no-content',
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: <Search className="w-12 h-12 text-muted-foreground" />,
          title: 'No results found',
          description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
          actionLabel: 'Clear Filters'
        };
      case 'no-connection':
        return {
          icon: <Wifi className="w-12 h-12 text-muted-foreground" />,
          title: 'Connection Error',
          description: 'Unable to load content. Please check your internet connection and try again.',
          actionLabel: 'Retry'
        };
      default:
        return {
          icon: <Film className="w-12 h-12 text-muted-foreground" />,
          title: 'No content available',
          description: 'We couldn\'t find any movies or shows to display at the moment.',
          actionLabel: 'Refresh'
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted">
        {defaultContent.icon}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">
          {title || defaultContent.title}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {description || defaultContent.description}
        </p>
      </div>

      {(onAction || actionLabel) && (
        <Button 
          variant="outline" 
          onClick={onAction}
          className="mt-4"
        >
          {actionLabel || defaultContent.actionLabel}
        </Button>
      )}
    </div>
  );
}