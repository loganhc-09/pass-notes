import { useState } from 'react'
import { supabase } from './lib/supabase'

const LUCY_GIF = 'https://media1.tenor.com/m/LoHebi2GhbkAAAAC/i-love-lucy-lucille-ball.gif'

const ChannelIcon = ({ id, className = "w-6 h-6" }) => {
  const icons = {
    tiktok: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/>
      </svg>
    ),
    linkedin: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    substack: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
      </svg>
    ),
    youtube: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    podcasts: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 3.6c4.636 0 8.4 3.764 8.4 8.4 0 1.572-.44 3.04-1.192 4.296l-1.536-1.536A6.002 6.002 0 0 0 18 12c0-3.312-2.688-6-6-6s-6 2.688-6 6a5.98 5.98 0 0 0 .336 1.968L4.8 15.504A8.352 8.352 0 0 1 3.6 12c0-4.636 3.764-8.4 8.4-8.4zm0 4.8a3.6 3.6 0 0 1 2.16 6.48l-.96-.96a2.398 2.398 0 0 0-2.4-2.4 2.4 2.4 0 0 0-2.4 2.4c0 .456.132.876.348 1.236l-.948.948A3.6 3.6 0 0 1 12 8.4zm0 2.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zm-1.2 4.8h2.4V24h-2.4v-8.4z"/>
      </svg>
    ),
    x: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    group: null,
    word_of_mouth: null,
  }
  if (!icons[id]) return null
  return icons[id]
}

const CHANNELS = [
  { id: 'tiktok', label: 'TikTok', emoji: '💬', hasIcon: true },
  { id: 'linkedin', label: 'LinkedIn', emoji: '💬', hasIcon: true },
  { id: 'substack', label: 'Substack / Newsletters', emoji: '💬', hasIcon: true },
  { id: 'youtube', label: 'YouTube', emoji: '💬', hasIcon: true },
  { id: 'podcasts', label: 'Podcasts', emoji: '💬', hasIcon: true },
  { id: 'x', label: 'X / Twitter', emoji: '💬', hasIcon: true },
  { id: 'group', label: 'This group chat', emoji: '💬', hasIcon: false },
  { id: 'word_of_mouth', label: 'Word of mouth', emoji: '🗣️', hasIcon: false },
]

const PULSE_OPTIONS = [
  { id: 'drowning', label: 'Drowning', emoji: '🌊', desc: 'There is SO much and I can\'t keep up' },
  { id: 'treading', label: 'Treading water', emoji: '🏊', desc: 'I catch some things but miss a lot' },
  { id: 'riding', label: 'Riding the wave', emoji: '🏄', desc: 'I\'ve got a decent system going' },
  { id: 'am_the_wave', label: 'I AM the wave', emoji: '🌊✨', desc: 'I\'m usually the one sharing stuff' },
]

function Quiz() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNote, setShowNote] = useState(false)

  // New flow:
  // 0=opener, 1=name, 2=pulse, 3=channels, 4=sources per channel, 5=artifact, 6=open box, 7=confirmation
  const [formData, setFormData] = useState({
    name: '',
    pulse: '',
    channels: [], // ordered list of selected channel ids
    channelSources: {}, // { channelId: [{ name: '', paid: false }, ...] }
    artifact: { title: '', link: '' },
    openBox: '',
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Insert sources per channel
    for (const channelId of formData.channels) {
      const sources = formData.channelSources[channelId] || []
      const channel = CHANNELS.find(c => c.id === channelId)
      for (const source of sources) {
        if (!source.name.trim()) continue
        const { error } = await supabase.from('sources').insert({
          name: source.name,
          handle: source.name.toLowerCase().replace(/\s+/g, ''),
          platform: 'Other',
          modality: 'read',
          url: '',
          added_by_id: null,
          added_by_name: formData.name || 'Anonymous',
          blurb: `📍 #${formData.channels.indexOf(channelId) + 1} ${channel?.label || channelId}${source.paid ? ' (paid)' : ''}`,
          urgency: 'this_week'
        })
        if (error) console.error('Source insert error:', error)
      }
    }

    // Insert pulse check
    if (formData.pulse) {
      await supabase.from('sources').insert({
        name: `Pulse: ${formData.pulse}`,
        handle: 'pulse-check',
        platform: 'Other',
        modality: 'read',
        url: '',
        added_by_id: null,
        added_by_name: formData.name || 'Anonymous',
        blurb: `🫀 Pulse check: ${formData.pulse} | Channels: ${formData.channels.join(', ')}`,
        urgency: 'this_week'
      })
    }

    // Insert artifact
    if (formData.artifact.title.trim()) {
      await supabase.from('sources').insert({
        name: formData.artifact.title,
        handle: 'artifact',
        platform: 'Other',
        modality: 'read',
        url: formData.artifact.link || '',
        added_by_id: null,
        added_by_name: formData.name || 'Anonymous',
        blurb: '📄 AI artifact from the last 10 days',
        urgency: 'this_week'
      })
    }

    // Insert open box
    if (formData.openBox.trim()) {
      await supabase.from('sources').insert({
        name: `Open note from ${formData.name || 'Anonymous'}`,
        handle: 'open-box',
        platform: 'Other',
        modality: 'read',
        url: '',
        added_by_id: null,
        added_by_name: formData.name || 'Anonymous',
        blurb: `💬 ${formData.openBox}`,
        urgency: 'this_week'
      })
    }

    setIsSubmitting(false)
    setShowNote(true)
    setTimeout(() => setStep(7), 500)
  }

  const canProceed = () => {
    switch(step) {
      case 0: return true
      case 1: return formData.name.trim().length > 0
      case 2: return !!formData.pulse
      case 3: return formData.channels.length >= 1
      case 4: {
        // If they only picked group/word_of_mouth, no sources needed
        const sourceChannels = formData.channels.filter(id => id !== 'group' && id !== 'word_of_mouth')
        if (sourceChannels.length === 0) return true
        return sourceChannels.some(
          id => (formData.channelSources[id] || []).some(s => s.name.trim())
        )
      }
      case 5: return true // artifact is optional
      case 6: return true // open box is optional
      default: return true
    }
  }

  const nextStep = () => {
    if (step === 6) {
      handleSubmit()
    } else if (step === 3) {
      // Skip sources step if only group/word_of_mouth selected
      const sourceChannels = formData.channels.filter(id => id !== 'group' && id !== 'word_of_mouth')
      setStep(sourceChannels.length > 0 ? 4 : 5)
    } else {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && canProceed() && step !== 4) {
      e.preventDefault()
      nextStep()
    }
  }

  const toggleChannel = (channelId) => {
    setFormData(prev => {
      const existing = prev.channels
      let newChannels
      if (existing.includes(channelId)) {
        newChannels = existing.filter(c => c !== channelId)
      } else {
        newChannels = [...existing, channelId]
      }
      // Initialize sources for newly added channels
      const newChannelSources = { ...prev.channelSources }
      for (const id of newChannels) {
        if (!newChannelSources[id]) {
          newChannelSources[id] = [
            { name: '', paid: false },
            { name: '', paid: false },
            { name: '', paid: false },
          ]
        }
      }
      return { ...prev, channels: newChannels, channelSources: newChannelSources }
    })
  }

  const updateChannelSource = (channelId, index, field, value) => {
    setFormData(prev => {
      const newChannelSources = { ...prev.channelSources }
      const sources = [...(newChannelSources[channelId] || [])]
      sources[index] = { ...sources[index], [field]: value }
      newChannelSources[channelId] = sources
      return { ...prev, channelSources: newChannelSources }
    })
  }

  const TOTAL_STEPS = 6 // name, pulse, channels, sources, artifact, open box
  const ProgressDots = () => (
    <div className="flex gap-2 justify-center mb-6">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < step ? 'bg-[#1B6B6B] w-6' : i === step ? 'bg-[#E07B54] w-8' : 'bg-[#1B3A5C]/20 w-4'
          }`}
        />
      ))}
    </div>
  )

  const BackButton = () => (
    <button
      onClick={prevStep}
      className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 hover:bg-white transition-all cursor-pointer shadow-sm"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
  )

  const PrimaryButton = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-[#E07B54] hover:bg-[#c96a47] text-white py-4 px-8 rounded-2xl text-lg font-semibold transition-all shadow-lg shadow-[#E07B54]/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
    >
      {children}
    </button>
  )

  // Step 0: Opener
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 overflow-hidden">
            <div className="relative">
              <img
                src={LUCY_GIF}
                alt="I Love Lucy chocolate factory scene"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>

            <div className="p-8 -mt-8 relative">
              <div className="flex items-center justify-center gap-2 mb-3">
                <img src={`${import.meta.env.BASE_URL}brainstorm-logo.png`} alt="Br(ai)nstorm Collective" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-xs text-[#1B6B6B] font-medium tracking-wide">Br(ai)nstorm Collective</span>
              </div>
              <h1 className="text-3xl font-bold text-[#1B3A5C] text-center mb-2">
                Pass Notes
              </h1>
              <p className="text-stone-500 text-center text-sm mb-6">
                A 2-min pulse check on how you're keeping up with AI.
              </p>

              <button
                onClick={nextStep}
                className="w-full bg-[#E07B54] hover:bg-[#c96a47] text-white py-4 px-8 rounded-2xl text-lg font-semibold transition-all shadow-lg cursor-pointer"
              >
                Let's do it
                <span className="ml-2">→</span>
              </button>

              <p className="text-stone-400 text-xs text-center mt-4">
                I'm crowdsourcing the highest-signal AI content so nobody has to find it alone.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 1: Name
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center p-6 relative">
        <BackButton />
        <ProgressDots />

        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 p-8">
            <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">
              What's your first name?
            </h2>
            <p className="text-stone-500 text-center mb-8">
              So I know whose notes these are
            </p>

            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="First name"
              autoFocus
              onKeyDown={handleKeyDown}
              className="w-full px-6 py-4 text-xl bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-amber-400 focus:bg-white focus:outline-none text-stone-800 placeholder-stone-300 text-center transition-all"
            />

            <div className="mt-8">
              <PrimaryButton onClick={nextStep} disabled={!canProceed()}>
                Next
                <span className="ml-2">→</span>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Pulse check
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center p-6 relative">
        <BackButton />
        <ProgressDots />

        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 p-8">
            <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">
              How are you keeping up with AI right now?
            </h2>
            <p className="text-stone-500 text-center mb-6">
              No wrong answers. Just a vibe check.
            </p>

            <div className="space-y-3">
              {PULSE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFormData({ ...formData, pulse: opt.id })}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    formData.pulse === opt.id
                      ? 'border-[#E07B54] bg-[#E07B54]/5 shadow-md'
                      : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div>
                      <p className={`font-semibold ${formData.pulse === opt.id ? 'text-[#E07B54]' : 'text-stone-700'}`}>
                        {opt.label}
                      </p>
                      <p className="text-stone-400 text-sm">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <PrimaryButton onClick={nextStep} disabled={!canProceed()}>
                Next
                <span className="ml-2">→</span>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Channel selection
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center p-6 relative">
        <BackButton />
        <ProgressDots />

        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 p-8">
            <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">
              Where do you get your AI info?
            </h2>
            <p className="text-stone-500 text-center mb-2">
              Tap in order of most → least valuable to you.
            </p>
            <p className="text-stone-400 text-center text-xs mb-6">
              Tap again to remove. Skip channels you never check.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CHANNELS.map(ch => {
                const selected = formData.channels.includes(ch.id)
                const orderIndex = formData.channels.indexOf(ch.id)
                return (
                  <button
                    key={ch.id}
                    onClick={() => toggleChannel(ch.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                      selected
                        ? 'border-[#1B6B6B] bg-[#1B6B6B]/5 shadow-md'
                        : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1B6B6B] text-white text-xs flex items-center justify-center font-bold">
                        {orderIndex + 1}
                      </span>
                    )}
                    <span className="text-xl block mb-1">
                      {ch.hasIcon ? <ChannelIcon id={ch.id} className={`w-6 h-6 ${selected ? 'text-[#1B6B6B]' : 'text-stone-400'}`} /> : ch.emoji}
                    </span>
                    <span className={`text-sm font-medium ${selected ? 'text-[#1B6B6B]' : 'text-stone-600'}`}>
                      {ch.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-6">
              <PrimaryButton onClick={nextStep} disabled={!canProceed()}>
                Next
                <span className="ml-2">→</span>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 4: Sources per channel
  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex flex-col p-6 relative">
        <BackButton />

        <div className="pt-16 pb-4">
          <ProgressDots />
        </div>

        <div className="max-w-lg w-full mx-auto flex-1 overflow-y-auto">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              Who do you trust on each?
            </h2>
            <p className="text-stone-400 text-sm">
              People, newsletters, accounts — whatever comes to mind. Leave blank if nothing specific.
            </p>
          </div>

          <div className="space-y-5">
            {formData.channels.filter(id => id !== 'group' && id !== 'word_of_mouth').map(channelId => {
              const channel = CHANNELS.find(c => c.id === channelId)
              const sources = formData.channelSources[channelId] || []
              return (
                <div key={channelId} className="bg-white rounded-2xl p-5 shadow-lg shadow-stone-900/5 border border-stone-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">
                      {channel?.hasIcon ? <ChannelIcon id={channelId} className="w-5 h-5 text-stone-500" /> : channel?.emoji}
                    </span>
                    <h3 className="font-semibold text-stone-700">{channel?.label}</h3>
                  </div>
                  <div className="space-y-2">
                    {sources.map((source, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={source.name}
                          onChange={(e) => updateChannelSource(channelId, i, 'name', e.target.value)}
                          placeholder={i === 0 ? 'e.g. Dr. Ayesha Khanna' : 'Another one...'}
                          className="flex-1 px-3 py-3 bg-stone-50 rounded-xl text-stone-800 placeholder-stone-300 focus:outline-none focus:bg-stone-100 focus:ring-2 focus:ring-amber-200 transition-all text-sm"
                        />
                        {source.name.trim() && (
                          <button
                            type="button"
                            onClick={() => updateChannelSource(channelId, i, 'paid', !source.paid)}
                            className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                              source.paid
                                ? 'bg-[#1B6B6B]/10 text-[#1B6B6B] border border-[#1B6B6B]/30'
                                : 'bg-stone-50 text-stone-400 border border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            {source.paid ? '✓' : '○'} Paid
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 mb-4">
            <PrimaryButton onClick={nextStep} disabled={!canProceed()}>
              Next
              <span className="ml-2">→</span>
            </PrimaryButton>
          </div>
        </div>
      </div>
    )
  }

  // Step 5: Artifact
  if (step === 5) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center p-6 relative">
        <BackButton />
        <ProgressDots />

        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 p-8">
            <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">
              One AI thing that's stuck with you
            </h2>
            <p className="text-stone-500 text-center mb-2">
              From the last 10 days. Article, video, thread...
            </p>
            <p className="text-stone-400 text-center text-sm mb-8">
              (I want to see what's cutting through the noise)
            </p>

            <div className="space-y-4">
              <input
                type="text"
                value={formData.artifact.title}
                onChange={(e) => setFormData({ ...formData, artifact: { ...formData.artifact, title: e.target.value }})}
                placeholder="Title or topic"
                onKeyDown={handleKeyDown}
                className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-800 placeholder-stone-300 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              />
              <input
                type="text"
                value={formData.artifact.link}
                onChange={(e) => setFormData({ ...formData, artifact: { ...formData.artifact, link: e.target.value }})}
                placeholder="Link if you have it"
                onKeyDown={handleKeyDown}
                className="w-full px-5 py-3 bg-stone-50/50 border border-stone-100 rounded-xl text-stone-600 placeholder-stone-300 text-sm focus:outline-none focus:border-amber-300 focus:bg-white transition-all"
              />
            </div>

            <div className="mt-8">
              <PrimaryButton onClick={nextStep}>
                {formData.artifact.title.trim() ? 'Next' : 'Skip'}
                <span className="ml-2">→</span>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 6: Open box
  if (step === 6) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center p-6 relative">
        <BackButton />
        <ProgressDots />

        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 p-8">
            <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">
              Last thing —
            </h2>
            <p className="text-stone-500 text-center mb-6">
              This group is an ongoing experiment in collective learning. What do you want to see more of? Suggestions? Feedback? I'm all ears.
            </p>

            <textarea
              value={formData.openBox}
              onChange={(e) => setFormData({ ...formData, openBox: e.target.value })}
              placeholder="What's been on your mind lately..."
              rows={4}
              className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-800 placeholder-stone-300 focus:outline-none focus:border-amber-400 focus:bg-white transition-all resize-none"
            />

            <div className="mt-8">
              <PrimaryButton onClick={nextStep} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : formData.openBox.trim() ? 'Pass my notes' : 'Skip & finish'}
                <span className="ml-2">→</span>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 7: Confirmation
  return (
    <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Logo */}
          <div className={`mb-5 transition-all duration-500 ${showNote ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <img src={`${import.meta.env.BASE_URL}brainstorm-logo.png`} alt="Br(ai)nstorm Collective" className="w-20 h-20 mx-auto rounded-full object-cover shadow-lg" />
          </div>

          <h2 className={`text-3xl font-bold text-[#1B3A5C] mb-4 transition-all duration-500 delay-100 ${showNote ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Notes passed ✓
          </h2>

          <div className={`transition-all duration-500 delay-200 ${showNote ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-[#1B3A5C]/70 text-base mb-3">
              This is what happens when smart people curate for each other.
            </p>
            <p className="text-[#1B3A5C]/60 text-sm mb-6">
              Stay tuned for some vibe coded goodness.
            </p>
          </div>

          <div className={`bg-[#FDF6E3] rounded-2xl p-5 transition-all duration-500 delay-300 ${showNote ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-[#1B3A5C]/50 text-sm">
              The best filter is a room full of people you trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Quiz
