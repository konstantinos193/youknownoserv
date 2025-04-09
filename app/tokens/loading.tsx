export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-black">
      {/* Background elements */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-cyan-950/10 to-gray-900 z-0"></div>
      <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-cyan-400/5 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-1/4 w-1/2 h-64 bg-yellow-300/5 blur-3xl rounded-full"></div>

      <div className="container px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-800 rounded-lg animate-pulse mr-3"></div>
              <div>
                <div className="h-6 w-32 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-800 rounded animate-pulse mt-1"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-32 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Search and filter bar skeleton */}
          <div className="bg-gray-900/50 border border-cyan-600/20 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-800 rounded animate-pulse"></div>
              <div className="flex gap-2">
                <div className="h-10 w-32 bg-gray-800 rounded animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="mb-6">
            <div className="flex gap-1 bg-gray-900/50 border border-cyan-600/20 p-1 rounded-lg w-fit">
              <div className="h-8 w-24 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-800 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-800 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Token list skeleton */}
          <div className="bg-gray-900/50 border border-cyan-600/20 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="bg-gray-900/80 border border-cyan-600/20 rounded-lg p-4 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-800"></div>
                      <div>
                        <div className="h-5 w-24 bg-gray-800 rounded truncate"></div>
                        <div className="h-3 w-16 bg-gray-800 rounded mt-1"></div>
                      </div>
                    </div>
                    <div className="h-5 w-20 bg-gray-800 rounded"></div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-gray-800 rounded"></div>
                      <div className="h-3 w-16 bg-gray-800 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-gray-800 rounded"></div>
                      <div className="h-3 w-16 bg-gray-800 rounded"></div>
                    </div>
                  </div>

                  <div className="h-3 w-full bg-gray-800 rounded"></div>

                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-cyan-600/10">
                    <div className="h-3 w-20 bg-gray-800 rounded"></div>
                    <div className="h-6 w-16 bg-gray-800 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
