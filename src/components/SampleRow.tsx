interface SampleRowProps {
  sample: Sample;
  isPlaying: boolean;
  onPlayPause: () => void;
  onDownload: () => void;
  onLike: () => void;
  isLiked: boolean;
  isDownloading: boolean;
}

function SampleRow({ 
  sample, 
  isPlaying, 
  onPlayPause, 
  onDownload, 
  onLike, 
  isLiked,
  isDownloading 
}: SampleRowProps) {
  return (
    <div className="group flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 transition-all">
      {/* Play Button */}
      <button
        onClick={onPlayPause}
        className="flex-shrink-0 w-10 h-10 bg-neutral-800 hover:bg-neutral-700 
          rounded-full flex items-center justify-center transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white ml-0.5" />
        )}
      </button>

      {/* Waveform - Takes up most space */}
      <div className="flex-1 min-w-0">
        <WaveformPlayer
          url={sample.file_url}
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          height={40}
          waveColor="#404040"
          progressColor="#3b82f6"
        />
      </div>

      {/* Sample Info */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        <span className="text-neutral-400 w-20">{sample.bpm} BPM</span>
        <span className="text-neutral-400 w-16">{sample.key}</span>
        <span className="text-neutral-400 w-20">{sample.genre}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onLike}
          className={`p-2 rounded-lg transition-colors
            ${isLiked 
              ? 'text-red-500 bg-red-500/20' 
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 
            rounded-lg transition-colors disabled:opacity-50"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Sample Name - Shows on hover */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
        transition-opacity bg-black/90 px-3 py-1 rounded-lg pointer-events-none">
        <p className="text-sm font-medium text-white">{sample.name}</p>
        <p className="text-xs text-neutral-400">{sample.artist?.name || 'LoopLib'}</p>
      </div>
    </div>
  );
}