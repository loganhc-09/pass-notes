import { useState } from 'react'
import { supabase } from './lib/supabase'

const LUCY_GIF = 'https://media1.tenor.com/m/LoHebi2GhbkAAAAC/i-love-lucy-lucille-ball.gif'

const CHANNELS = [
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'linkedin', label: 'LinkedIn', emoji: '💼' },
  { id: 'substack', label: 'Substack / Newsletters', emoji: '📧' },
  { id: 'youtube', label: 'YouTube', emoji: '📺' },
  { id: 'podcasts', label: 'Podcasts', emoji: '🎧' },
  { id: 'x', label: 'X / Twitter', emoji: '𝕏' },
  { id: 'group', label: 'This group chat', emoji: '💬' },
  { id: 'word_of_mouth', label: 'Word of mouth', emoji: '🗣️' },
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
          blurb: `📍 ${channel?.label || channelId}${source.paid ? ' (paid)' : ''}`,
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
        // At least one source name across all channels
        return Object.values(formData.channelSources).some(
          sources => sources.some(s => s.name.trim())
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
                Takes 2 min. Stay tuned.
              </p>

              <button
                onClick={nextStep}
                className="w-full bg-[#E07B54] hover:bg-[#c96a47] text-white py-4 px-8 rounded-2xl text-lg font-semibold transition-all shadow-lg cursor-pointer"
              >
                Let's do it
                <span className="ml-2">→</span>
              </button>

              <p className="text-stone-400 text-xs text-center mt-4">
                Crowdsourcing the highest-signal AI content so nobody has to find it alone.
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
            <p className="text-stone-500 text-center mb-6">
              Pick all that apply. We'll ask about each one next.
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
                    <span className="text-xl block mb-1">{ch.emoji}</span>
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
            {formData.channels.map(channelId => {
              const channel = CHANNELS.find(c => c.id === channelId)
              const sources = formData.channelSources[channelId] || []
              return (
                <div key={channelId} className="bg-white rounded-2xl p-5 shadow-lg shadow-stone-900/5 border border-stone-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{channel?.emoji}</span>
                    <h3 className="font-semibold text-stone-700">{channel?.label}</h3>
                  </div>
                  <div className="space-y-2">
                    {sources.map((source, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={source.name}
                          onChange={(e) => updateChannelSource(channelId, i, 'name', e.target.value)}
                          placeholder={i === 0 ? 'e.g. Nate Jones' : 'Another one...'}
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
              Anything else on your mind?
            </h2>
            <p className="text-stone-500 text-center mb-6">
              Topics you want the group to explore, tools you're curious about, things you're stuck on... anything goes.
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
