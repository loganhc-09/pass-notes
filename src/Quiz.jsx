import { useState } from 'react'
import { supabase } from './lib/supabase'

const LUCY_GIF = 'https://media1.tenor.com/m/LoHebi2GhbkAAAAC/i-love-lucy-lucille-ball.gif'

function Quiz() {
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNote, setShowNote] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    sources: [
      { name: '', channel: '', why: '', paid: false },
      { name: '', channel: '', why: '', paid: false },
      { name: '', channel: '', why: '', paid: false },
      { name: '', channel: '', why: '', paid: false },
      { name: '', channel: '', why: '', paid: false },
    ],
    artifact: { title: '', link: '' },
    theOne: { name: '', channel: '' }
  })

  const updateSource = (index, field, value) => {
    setFormData(prev => {
      const newSources = [...prev.sources]
      newSources[index] = { ...newSources[index], [field]: value }
      return { ...prev, sources: newSources }
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const validSources = formData.sources.filter(c => c.name.trim())

    for (const source of validSources) {
      const { error } = await supabase.from('sources').insert({
        name: source.name,
        handle: source.channel || source.name.toLowerCase().replace(/\s+/g, ''),
        platform: 'Other',
        modality: 'read',
        url: '',
        added_by_id: null,
        added_by_name: formData.name || 'Anonymous',
        blurb: source.why || null,
        urgency: 'this_week'
      })
      if (error) console.error('Source insert error:', error)
    }

    if (formData.theOne.name.trim()) {
      await supabase.from('sources').insert({
        name: formData.theOne.name,
        handle: formData.theOne.channel || formData.theOne.name.toLowerCase().replace(/\s+/g, ''),
        platform: formData.theOne.channel || 'Other',
        modality: 'read',
        url: '',
        added_by_id: null,
        added_by_name: formData.name || 'Anonymous',
        blurb: '⭐ The One - if I could only follow one',
        urgency: 'drop_everything'
      })
    }

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

    setIsSubmitting(false)
    setShowNote(true)
    setTimeout(() => setStep(5), 500)
  }

  const canProceed = () => {
    switch(step) {
      case 0: return true
      case 1: return formData.name.trim().length > 0
      case 2: return formData.sources.filter(c => c.name.trim()).length >= 1
      case 3: return true
      case 4: return formData.theOne.name.trim().length > 0
      default: return true
    }
  }

  const nextStep = () => {
    if (step === 4) {
      handleSubmit()
    } else {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && canProceed() && step !== 2) {
      e.preventDefault()
      nextStep()
    }
  }

  // 5 steps now: 0=opener, 1=name, 2=sources, 3=artifact, 4=theOne, 5=done
  const ProgressDots = () => (
    <div className="flex gap-2 justify-center mb-6">
      {[1, 2, 3, 4].map(i => (
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

  // Step 0: Combined opener - Lucy GIF + problem + branding + CTA
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

  // Step 2: 5 Sources
  if (step === 2) {
    const whyPrompts = [
      "What's the vibe?",
      "In 3 words...",
      "Why do you love it?",
      "Sell me on it",
      "What keeps you coming back?"
    ]

    return (
      <div className="min-h-screen bg-[#FDF6E3] flex flex-col p-6 relative">
        <BackButton />

        <div className="pt-16 pb-4">
          <ProgressDots />
        </div>

        <div className="max-w-lg w-full mx-auto flex-1 overflow-y-auto">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              Last 5 sources you've recommended to someone
            </h2>
            <p className="text-stone-400 text-sm">
              e.g. <span className="text-stone-500 italic">Nate Jones</span> on <span className="text-stone-500 italic">Substack</span>
            </p>
          </div>

          <div className="space-y-3">
            {formData.sources.map((source, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 shadow-lg shadow-stone-900/5 border border-stone-100"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#F5C04A]/30 text-[#1B3A5C] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={source.name}
                    onChange={(e) => updateSource(i, 'name', e.target.value)}
                    placeholder="Name"
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-3 bg-stone-50 rounded-xl text-stone-800 placeholder-stone-300 focus:outline-none focus:bg-stone-100 focus:ring-2 focus:ring-amber-200 transition-all min-w-0 text-sm"
                  />
                  <input
                    type="text"
                    value={source.channel}
                    onChange={(e) => updateSource(i, 'channel', e.target.value)}
                    placeholder="Channel"
                    onKeyDown={handleKeyDown}
                    className="w-24 px-2 py-3 bg-stone-50 rounded-xl text-stone-600 placeholder-stone-300 text-xs focus:outline-none focus:bg-stone-100 focus:ring-2 focus:ring-amber-200 transition-all text-center"
                  />
                </div>
                {source.name.trim() && (
                  <div className="mt-3 ml-11 flex items-center gap-3">
                    <input
                      type="text"
                      value={source.why}
                      onChange={(e) => updateSource(i, 'why', e.target.value)}
                      placeholder={whyPrompts[i]}
                      className="flex-1 px-4 py-2.5 bg-stone-50/50 rounded-xl text-stone-600 placeholder-stone-400 text-sm focus:outline-none focus:bg-stone-100 transition-all italic"
                    />
                    <button
                      type="button"
                      onClick={() => updateSource(i, 'paid', !source.paid)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                        source.paid
                          ? 'bg-[#1B6B6B]/10 text-[#1B6B6B] border border-[#1B6B6B]/30'
                          : 'bg-stone-50 text-stone-400 border border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {source.paid ? '✓' : '○'} Paid
                    </button>
                  </div>
                )}
              </div>
            ))}
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

  // Step 3: Artifact
  if (step === 3) {
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

  // Step 4: The One
  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center p-6 relative">
        <BackButton />
        <ProgressDots />

        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl shadow-amber-900/10 p-8">
            <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center leading-tight">
              If you got your AI news from ONE source for the next month...
            </h2>
            <p className="text-stone-500 text-center mb-8">
              What survives the cull?
            </p>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 space-y-3">
              <input
                type="text"
                value={formData.theOne.name}
                onChange={(e) => setFormData({ ...formData, theOne: { ...formData.theOne, name: e.target.value }})}
                placeholder="Source name"
                autoFocus
                onKeyDown={handleKeyDown}
                className="w-full px-5 py-4 bg-white rounded-xl text-stone-800 placeholder-stone-400 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all text-center"
              />
              <input
                type="text"
                value={formData.theOne.channel}
                onChange={(e) => setFormData({ ...formData, theOne: { ...formData.theOne, channel: e.target.value }})}
                placeholder="Where do you follow them?"
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 bg-white/80 rounded-xl text-stone-600 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all text-center"
              />
            </div>

            <div className="mt-8">
              <PrimaryButton onClick={nextStep} disabled={!canProceed() || isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Pass my notes'}
                <span className="ml-2">→</span>
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 5: Confirmation - with Br(ai)nstorm colors: coral #E07B54, teal #1B6B6B, navy #1B3A5C, yellow #F5C04A, cream #FDF6E3
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
