// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-neutral-400 mb-4">Failed to load samples. Please try again.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}