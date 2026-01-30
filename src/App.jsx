import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import SourceCard from './components/SourceCard'
import AddSourceModal from './components/AddSourceModal'
import AuthModal from './components/AuthModal'

function App() {
  const [sources, setSources] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState(null)
  const [userDisplayName, setUserDisplayName] = useState('')
  const [theOnePick, setTheOnePick] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setUserDisplayName(getDisplayName(session.user))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setUserDisplayName(getDisplayName(session.user))
      }
    })

    fetchSources()

    return () => subscription.unsubscribe()
  }, [])

  // Fetch user's The One pick when user changes
  useEffect(() => {
    if (user) {
      fetchTheOnePick()
    } else {
      setTheOnePick(null)
    }
  }, [user])

  const getDisplayName = (user) => {
    // Try to get name from user metadata, fall back to email prefix
    return user.user_metadata?.display_name ||
           user.user_metadata?.name ||
           user.email?.split('@')[0] ||
           'Anonymous'
  }

  const fetchSources = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sources_with_counts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sources:', error)
    } else {
      setSources(data || [])
    }
    setLoading(false)
  }

  const fetchTheOnePick = async () => {
    if (!user) return

    const weekStart = getWeekStart()
    const { data: pickData } = await supabase
      .from('the_one_picks')
      .select('*, sources(*)')
      .eq('week_start', weekStart)
      .eq('user_id', user.id)
      .single()

    if (pickData) {
      setTheOnePick(pickData.sources)
    } else {
      setTheOnePick(null)
    }
  }

  const getWeekStart = () => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTheOnePick(null)
  }

  const requireAuth = (action) => {
    if (!user) {
      setShowAuthModal(true)
      return false
    }
    return true
  }

  const handleSecond = async (sourceId) => {
    if (!requireAuth()) return

    const { error } = await supabase
      .from('seconds')
      .insert({
        source_id: sourceId,
        user_id: user.id,
        user_name: userDisplayName
      })

    if (error) {
      if (error.code === '23505') {
        alert("You've already seconded this one!")
      } else {
        console.error('Error seconding:', error)
      }
    } else {
      fetchSources()
    }
  }

  const handlePickTheOne = async (sourceId) => {
    if (!requireAuth()) return

    const weekStart = getWeekStart()

    // Delete any existing pick for this week
    await supabase
      .from('the_one_picks')
      .delete()
      .eq('user_id', user.id)
      .eq('week_start', weekStart)

    // Insert new pick
    const { error } = await supabase
      .from('the_one_picks')
      .insert({
        source_id: sourceId,
        user_id: user.id,
        user_name: userDisplayName,
        week_start: weekStart
      })

    if (error) {
      console.error('Error picking The One:', error)
    } else {
      const source = sources.find(s => s.id === sourceId)
      setTheOnePick(source)
      fetchSources()
    }
  }

  const handleAddSource = async (sourceData) => {
    if (!requireAuth()) return

    const { error } = await supabase
      .from('sources')
      .insert({
        ...sourceData,
        added_by_id: user.id,
        added_by_name: userDisplayName
      })

    if (error) {
      console.error('Error adding source:', error)
      alert('Error adding source. Please try again.')
    } else {
      setShowAddModal(false)
      fetchSources()
    }
  }

  const handleAddClick = () => {
    if (!requireAuth()) return
    setShowAddModal(true)
  }

  const filteredSources = activeTab === 'all'
    ? sources
    : sources.filter(s => s.modality === activeTab)

  const tabs = [
    { id: 'all', label: '✨ All', emoji: '✨' },
    { id: 'read', label: '📖 Read', emoji: '📖' },
    { id: 'listen', label: '🎧 Listen', emoji: '🎧' },
    { id: 'watch', label: '📺 Watch', emoji: '📺' },
  ]

  const urgencyEmoji = {
    drop_everything: '🔥',
    this_week: '⚡',
    when_i_see_it: '📌'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                Pass Notes
              </h1>
              <p className="text-sm text-gray-500">What's everyone actually reading?</p>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{userDisplayName}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Sign out
                  </button>
                  <button
                    onClick={handleAddClick}
                    className="bg-gradient-to-r from-rose-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-shadow"
                  >
                    + Add Source
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-shadow"
                >
                  Sign in to contribute
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* The One - This Week's Pick (only show if logged in and has a pick) */}
        {user && theOnePick && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-100 to-rose-100 rounded-2xl border-2 border-amber-300">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">👆</span>
              <h2 className="font-bold text-amber-800">Your "The One" This Week</h2>
            </div>
            <div className="bg-white/70 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{theOnePick.name}</h3>
                  <p className="text-sm text-gray-500">@{theOnePick.handle} • {theOnePick.platform}</p>
                  {theOnePick.blurb && (
                    <p className="mt-2 text-gray-600 text-sm italic">"{theOnePick.blurb}"</p>
                  )}
                </div>
                <a
                  href={theOnePick.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-500 hover:text-rose-700"
                >
                  →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Modality Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-rose-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sources Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredSources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No sources yet. Be the first to share!</p>
            {user ? (
              <button
                onClick={handleAddClick}
                className="text-rose-500 hover:text-rose-700 font-medium"
              >
                + Add a source
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-rose-500 hover:text-rose-700 font-medium"
              >
                Sign in to add sources
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSources.map(source => (
              <SourceCard
                key={source.id}
                source={source}
                urgencyEmoji={urgencyEmoji}
                onSecond={() => handleSecond(source.id)}
                onPickTheOne={() => handlePickTheOne(source.id)}
                isTheOne={theOnePick?.id === source.id}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddSourceModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSource}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}

export default App
