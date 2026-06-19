'use client'

import { useEffect, useRef, useState } from 'react'

const EXEC_STEPS = [
  { label: 'Parsing Intent', sub: 'Intent recognized' },
  { label: 'Building Transaction', sub: 'Constructing secure tx' },
  { label: 'Route Optimization', sub: 'Finding best execution' },
  { label: 'Executing Swap', sub: 'Submitting to chain' },
]

type Phase =
  | 'idle'
  | 'typing-user'
  | 'typing-ghost'
  | 'ghost-reply'
  | 'executing'
  | 'complete'

export default function GhostPhone({ delayed = false }: { delayed?: boolean }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [userText, setUserText] = useState('')
  const [ghostText, setGhostText] = useState('')
  const [stepsDone, setStepsDone] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const USER_MSG = 'Swap 50 USDC to ETH'
  const GHOST_MSG = 'Understood. Executing swap.'

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const run = () => {
    clear()
    setPhase('idle')
    setUserText('')
    setGhostText('')
    setStepsDone(0)
    setShowResult(false)

    // Start typing user message
    timerRef.current = setTimeout(() => {
      setPhase('typing-user')
      let i = 0
      const typeUser = () => {
        if (i <= USER_MSG.length) {
          setUserText(USER_MSG.slice(0, i))
          i++
          timerRef.current = setTimeout(typeUser, 60)
        } else {
          // Ghost thinking
          timerRef.current = setTimeout(() => {
            setPhase('typing-ghost')
            let j = 0
            const typeGhost = () => {
              if (j <= GHOST_MSG.length) {
                setGhostText(GHOST_MSG.slice(0, j))
                j++
                timerRef.current = setTimeout(typeGhost, 45)
              } else {
                setPhase('ghost-reply')
                // Execute steps sequentially
                timerRef.current = setTimeout(() => {
                  setPhase('executing')
                  let step = 0
                  const nextStep = () => {
                    if (step < EXEC_STEPS.length) {
                      setStepsDone(step + 1)
                      step++
                      timerRef.current = setTimeout(nextStep, 700)
                    } else {
                      setPhase('complete')
                      setShowResult(true)
                      // Reset after pause
                      timerRef.current = setTimeout(run, 3000)
                    }
                  }
                  nextStep()
                }, 500)
              }
            }
            typeGhost()
          }, 800)
        }
      }
      typeUser()
    }, delayed ? 1000 : 200)
  }

  useEffect(() => {
    run()
    return clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="iphone-frame w-[220px] h-[440px] flex flex-col"
      style={{ animationDelay: delayed ? '1s' : '0s' }}
    >
      {/* Status bar spacer */}
      <div className="h-8 flex-shrink-0" />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(168,85,247,0.15)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)' }}
          >
            <span className="font-orbitron text-purple-400" style={{ fontSize: '7px' }}>G</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-orbitron text-white" style={{ fontSize: '10px' }}>GHOST</span>
              <span className="animate-pulse-dot" style={{ color: '#A855F7', fontSize: '8px' }}>●</span>
            </div>
          </div>
        </div>
        <span className="text-grey" style={{ fontSize: '16px' }}>⋯</span>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col justify-end px-3 py-3 gap-2 overflow-hidden">
        {/* Ghost greeting */}
        <div className="flex items-start gap-2">
          <div
            className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
            style={{ background: 'rgba(168,85,247,0.2)' }}
          >
            <span className="font-orbitron text-purple-400" style={{ fontSize: '6px' }}>G</span>
          </div>
          <div
            className="rounded-lg px-2 py-1.5"
            style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <p className="font-rajdhani text-white" style={{ fontSize: '10px' }}>
              Good evening, Sovereign.
            </p>
            <p className="font-rajdhani text-grey" style={{ fontSize: '8px' }}>9:41 PM</p>
          </div>
        </div>

        {/* User message */}
        {(phase !== 'idle' || userText) && (
          <div className="flex justify-end">
            <div
              className="rounded-lg px-2 py-1.5 max-w-[75%]"
              style={{ background: 'rgba(168,85,247,0.25)', border: '1px solid rgba(168,85,247,0.4)' }}
            >
              <p className="font-rajdhani text-white" style={{ fontSize: '10px' }}>
                {userText}
                {phase === 'typing-user' && <span className="typewriter-cursor" />}
              </p>
              {phase !== 'typing-user' && (
                <p className="font-rajdhani text-grey" style={{ fontSize: '8px' }}>9:41 PM ✓✓</p>
              )}
            </div>
          </div>
        )}

        {/* Ghost typing / reply */}
        {(phase === 'typing-ghost' || phase === 'ghost-reply' || phase === 'executing' || phase === 'complete') && (
          <div className="flex items-start gap-2">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: 'rgba(168,85,247,0.2)' }}
            >
              <span className="font-orbitron text-purple-400" style={{ fontSize: '6px' }}>G</span>
            </div>
            <div className="flex flex-col gap-1.5 max-w-[80%]">
              <div
                className="rounded-lg px-2 py-1.5"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
              >
                <p className="font-rajdhani text-white" style={{ fontSize: '10px' }}>
                  {ghostText}
                  {phase === 'typing-ghost' && <span className="typewriter-cursor" />}
                </p>
              </div>

              {/* Exec steps */}
              {(phase === 'executing' || phase === 'complete') && (
                <div
                  className="rounded-lg p-2 flex flex-col gap-1.5"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(168,85,247,0.2)',
                  }}
                >
                  <p className="font-rajdhani text-white font-semibold" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                    Swapping 50 USDC → ETH
                  </p>
                  <p className="font-rajdhani text-grey" style={{ fontSize: '8px' }}>via Uniswap v3</p>
                  {EXEC_STEPS.map((step, i) => (
                    <div
                      key={step.label}
                      className={`exec-step ${i < stepsDone ? 'done' : i === stepsDone ? 'active' : ''}`}
                      style={{ opacity: i <= stepsDone ? 1 : 0.3 }}
                    >
                      <div className="check">
                        {i < stepsDone && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-rajdhani text-white" style={{ fontSize: '9px' }}>{step.label}</p>
                        <p className="font-rajdhani text-grey" style={{ fontSize: '7px' }}>{step.sub}</p>
                      </div>
                      <span className="font-mono text-grey ml-auto" style={{ fontSize: '7px' }}>
                        9:41:{12 + i * 2} PM
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {showResult && (
                <div
                  className="rounded-lg px-2 py-1.5"
                  style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
                >
                  <p className="font-rajdhani text-white" style={{ fontSize: '10px' }}>
                    50 USDC → ETH initiated.
                  </p>
                  <p className="font-rajdhani text-grey" style={{ fontSize: '9px' }}>
                    You will receive ~0.0301 ETH
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(168,85,247,0.15)' }}
      >
        <div
          className="flex-1 h-7 rounded-full flex items-center px-3"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <span className="font-rajdhani text-grey" style={{ fontSize: '9px' }}>
            Message Ghost...
          </span>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(168,85,247,0.2)' }}
        >
          <span style={{ fontSize: '10px' }}>🎤</span>
        </div>
      </div>
    </div>
  )
}
