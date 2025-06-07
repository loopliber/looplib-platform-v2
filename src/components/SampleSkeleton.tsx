// components/SampleSkeleton.tsx
export default function SampleSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-neutral-900/30 border border-neutral-800 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="h-4 bg-neutral-800 rounded w-1/4 mb-3"></div>
              <div className="h-6 bg-neutral-800 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-neutral-800 rounded w-1/3 mb-4"></div>
              <div className="h-12 bg-neutral-800 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <div className="h-6 bg-neutral-800 rounded w-16"></div>
                  <div className="h-6 bg-neutral-800 rounded w-16"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-neutral-800 rounded w-20"></div>
                  <div className="h-8 bg-neutral-800 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}