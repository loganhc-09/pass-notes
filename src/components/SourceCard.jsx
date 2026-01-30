function SourceCard({ source, urgencyEmoji, onSecond, onPickTheOne, isTheOne, isLoggedIn }) {
  const modalityEmoji = {
    read: '📖',
    listen: '🎧',
    watch: '📺'
  }

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${isTheOne ? 'border-amber-300 ring-2 ring-amber-200' : 'border-gray-100'} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{modalityEmoji[source.modality]}</span>
            <span className="text-lg">{urgencyEmoji[source.urgency]}</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {source.platform}
            </span>
            {isTheOne && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                👆 Your pick
              </span>
            )}
          </div>

          {/* Name and handle */}
          <h3 className="font-semibold text-gray-800 truncate">{source.name}</h3>
          <p className="text-sm text-gray-500">@{source.handle}</p>

          {/* Blurb */}
          {source.blurb && (
            <p className="mt-2 text-gray-600 text-sm italic line-clamp-2">"{source.blurb}"</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span>Added by {source.added_by_name}</span>
            {source.second_count > 0 && (
              <span className="text-rose-500 font-medium">🙌 {source.second_count} seconds</span>
            )}
            {source.build_count > 0 && (
              <span className="text-teal-500 font-medium">🔨 {source.build_count} builds</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors"
            title="Open link"
          >
            →
          </a>
          <button
            onClick={onSecond}
            className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"
            title="Second this"
          >
            🙌
          </button>
          <button
            onClick={onPickTheOne}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              isTheOne
                ? 'bg-amber-100 text-amber-600'
                : 'bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-500'
            }`}
            title="Make this The One"
          >
            👆
          </button>
        </div>
      </div>
    </div>
  )
}

export default SourceCard
