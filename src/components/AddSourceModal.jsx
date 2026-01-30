import { useState } from 'react'

function AddSourceModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    platform: 'TikTok',
    modality: 'watch',
    url: '',
    blurb: '',
    urgency: 'this_week'
  })

  const platforms = ['TikTok', 'YouTube', 'Substack', 'Newsletter', 'Podcast', 'LinkedIn', 'Twitter/X', 'Other']
  const modalities = [
    { value: 'read', label: '📖 Read' },
    { value: 'listen', label: '🎧 Listen' },
    { value: 'watch', label: '📺 Watch' }
  ]
  const urgencies = [
    { value: 'drop_everything', label: '🔥 Drop everything', desc: 'Life-changing content' },
    { value: 'this_week', label: '⚡ This week', desc: 'Worth prioritizing' },
    { value: 'when_i_see_it', label: '📌 When I see it', desc: 'Good background content' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.handle || !formData.url) {
      alert('Please fill in name, handle, and URL')
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Add a Source</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name / Title *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Lenny's Newsletter"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            />
          </div>

          {/* Handle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Handle / Username *
            </label>
            <input
              type="text"
              value={formData.handle}
              onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
              placeholder="e.g., lennyrachitsky"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            >
              {platforms.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Modality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you consume it?
            </label>
            <div className="flex gap-2">
              {modalities.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, modality: m.value })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.modality === m.value
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link *
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How urgent is it?
            </label>
            <div className="space-y-2">
              {urgencies.map(u => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: u.value })}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    formData.urgency === u.value
                      ? 'bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-rose-300'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium text-gray-800">{u.label}</div>
                  <div className="text-xs text-gray-500">{u.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Blurb */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why do you love it? (optional)
            </label>
            <textarea
              value={formData.blurb}
              onChange={(e) => setFormData({ ...formData, blurb: e.target.value })}
              placeholder="What makes this source special?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
          >
            Add Source
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddSourceModal
