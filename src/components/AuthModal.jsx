import { useState } from 'react'
import { supabase } from '../lib/supabase'

function AuthModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email' })
      return
    }

    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: {
          display_name: displayName.trim() || email.split('@')[0]
        }
      }
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({
        type: 'success',
        text: 'Check your email for a magic link!'
      })
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-8 text-center text-white">
          <div className="text-4xl mb-2">✨</div>
          <h2 className="text-xl font-bold">Join Br(ai)nstorm Sources</h2>
          <p className="text-rose-100 text-sm mt-1">Sign in with your email to contribute</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display name (optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we call you?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              This is how others will see who added sources
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 pt-2">
            We'll email you a link to sign in. No password needed.
          </p>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
