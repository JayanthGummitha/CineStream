import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white/60">Loading TV Show...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}