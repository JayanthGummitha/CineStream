import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  const shortcuts = [
    {
      category: 'Playback',
      items: [
        { key: 'Space', description: 'Play/Pause' },
        { key: '←', description: 'Skip backward 10s' },
        { key: '→', description: 'Skip forward 10s' },
        { key: '↑', description: 'Volume up' },
        { key: '↓', description: 'Volume down' },
        { key: 'M', description: 'Mute/Unmute' },
      ]
    },
    {
      category: 'Display',
      items: [
        { key: 'F', description: 'Toggle fullscreen' },
        { key: 'T', description: 'Toggle theater mode' },
        { key: 'C', description: 'Toggle captions' },
      ]
    },
    {
      category: 'General',
      items: [
        { key: '?', description: 'Show keyboard shortcuts' },
        { key: 'Esc', description: 'Close dialogs/Exit fullscreen' },
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="font-semibold text-slate-200 mb-3">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                    <span className="text-slate-300">{item.description}</span>
                    <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-200">
                      {item.key}
                    </Badge>
                  </div>
                ))}
              </div>
              {category.category !== shortcuts[shortcuts.length - 1].category && (
                <Separator className="mt-4 bg-slate-700" />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-sm text-slate-400 text-center mt-4">
          Press <Badge variant="outline" className="bg-slate-700 border-slate-600 text-slate-200 mx-1">Esc</Badge> to close
        </div>
      </DialogContent>
    </Dialog>
  );
}