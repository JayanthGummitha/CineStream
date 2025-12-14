import { Loader2 } from 'lucide-react';

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-white/50" />
    </div>
  );
}
