import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  type EdgePatch,
  type Item,
  type NodePatch,
  type Packet,
  type Scene,
  type SceneEdge,
  type SceneNode,
} from '../animations/types'
import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon, RestartIcon } from './Icons'
import styles from './Animation.module.css'

const PHASE_MS = 950
const MIN_STEP_MS = 350

type NodeState = Required<Pick<SceneNode, 'w' | 'h' | 'shape' | 'tone'>> & SceneNode
type EdgeState = SceneEdge

const edgeKey = (e: { from: string; to: string }) => `${e.from}>${e.to}`

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function phases(packets: Packet[] | undefined) {
  return packets?.length ? Math.max(...packets.map((p) => p.phase ?? 0)) + 1 : 0
}

function stepDuration(scene: Scene, index: number) {
  return Math.max(MIN_STEP_MS, phases(scene.steps[index]?.packets) * PHASE_MS)
}

/** How long to pause on a step before auto-advancing, scaled to caption length. */
function holdDuration(caption: string) {
  return 1400 + caption.split(/\s+/).length * 55
}

function applyNodes(nodes: Map<string, NodeState>, patch?: Record<string, NodePatch>) {
  if (!patch) return
  for (const [id, p] of Object.entries(patch)) {
    const n = nodes.get(id)
    if (n) nodes.set(id, { ...n, ...p } as NodeState)
  }
}

function applyEdges(edges: Map<string, EdgeState>, patch?: Record<string, EdgePatch>) {
  if (!patch) return
  for (const [key, p] of Object.entries(patch)) {
    const e = edges.get(key)
    if (e) edges.set(key, { ...e, ...p })
  }
}

/** Box and edge state at a step: every earlier step's changes, then this one's. */
function stateAt(scene: Scene, index: number, arrived: boolean) {
  const nodes = new Map<string, NodeState>(
    scene.nodes.map((n) => [
      n.id,
      { w: 92, h: n.items ? 56 : n.sub ? 46 : 40, shape: 'rect', tone: 'neutral', ...n } as NodeState,
    ]),
  )
  const edges = new Map<string, EdgeState>(scene.edges.map((e) => [edgeKey(e), e]))
  scene.steps.forEach((s, i) => {
    if (i > index) return
    applyNodes(nodes, s.set)
    applyEdges(edges, s.edges)
    if (i < index || arrived) applyNodes(nodes, s.after)
  })
  return { nodes, edges }
}

/** Where the line from a box's centre towards (tx, ty) leaves the box. */
function boundary(n: NodeState, tx: number, ty: number): [number, number] {
  const dx = tx - n.x
  const dy = ty - n.y
  if (dx === 0 && dy === 0) return [n.x, n.y]
  if (n.shape === 'circle') {
    const len = Math.hypot(dx, dy)
    const r = n.w / 2
    return [n.x + (dx / len) * r, n.y + (dy / len) * r]
  }
  const s = Math.min(n.w / 2 / Math.abs(dx || 1e-9), n.h / 2 / Math.abs(dy || 1e-9))
  return [n.x + dx * s, n.y + dy * s]
}

function endpoints(a: NodeState, b: NodeState) {
  const [x1, y1] = boundary(a, b.x, b.y)
  const [x2, y2] = boundary(b, a.x, a.y)
  return { x1, y1, x2, y2 }
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

function itemLabel(item: Item) {
  return typeof item === 'string' ? { label: item, tone: undefined } : item
}

/** Shrinks text that would overflow its box. Widths are rough per-character estimates. */
function fit(text: string, boxWidth: number, size: number, charWidth: number) {
  const room = boxWidth - 12
  const needed = text.length * size * charWidth
  return needed > room ? { fontSize: `${Math.max(9, (size * room) / needed).toFixed(1)}px` } : undefined
}

function NodeView({ n }: { n: NodeState }) {
  const { w, h } = n
  const hasItems = !!n.items?.length
  const labelY = hasItems ? -h / 2 + 15 : n.sub ? -7 : 1
  let shape
  if (n.shape === 'circle') {
    shape = <circle className={styles.shape} r={w / 2} />
  } else if (n.shape === 'cylinder') {
    const ry = 6
    shape = (
      <>
        <path
          className={styles.shape}
          d={`M${-w / 2},${-h / 2 + ry} v${h - 2 * ry} a${w / 2},${ry} 0 0 0 ${w},0 v${-(h - 2 * ry)}`}
        />
        <ellipse className={styles.shape} cx={0} cy={-h / 2 + ry} rx={w / 2} ry={ry} />
      </>
    )
  } else {
    shape = <rect className={styles.shape} x={-w / 2} y={-h / 2} width={w} height={h} rx={6} />
  }
  const items = n.items ?? []
  const cell = Math.min(22, (w - 10) / Math.max(items.length, 1) - 3)
  const rowW = items.length * (cell + 3) - 3
  return (
    <g
      className={styles.node}
      data-tone={n.tone}
      data-hidden={n.hidden ? 'true' : undefined}
      style={{ transform: `translate(${n.x}px, ${n.y}px)` }}
    >
      {shape}
      <text className={styles.label} y={labelY} dominantBaseline="middle" textAnchor="middle" style={fit(n.label, w, 14.5, 0.58)}>
        {n.label}
      </text>
      {n.sub && !hasItems && (
        <text className={styles.sub} y={12.5} dominantBaseline="middle" textAnchor="middle" style={fit(n.sub, w, 12.5, 0.54)}>
          {n.sub}
        </text>
      )}
      {items.map((raw, i) => {
        const it = itemLabel(raw)
        const x = -rowW / 2 + i * (cell + 3)
        const y = h / 2 - cell - 8
        return (
          <g key={i} className={styles.item} data-tone={it.tone}>
            <rect x={x} y={y} width={cell} height={cell} rx={3} />
            {it.label && (
              <text x={x + cell / 2} y={y + cell / 2 + 0.5} dominantBaseline="middle" textAnchor="middle">
                {it.label}
              </text>
            )}
          </g>
        )
      })}
      {n.sub && hasItems && (
        <text className={styles.sub} y={-h / 2 - 9} dominantBaseline="middle" textAnchor="middle">
          {n.sub}
        </text>
      )}
    </g>
  )
}

function EdgeView({ e, nodes }: { e: EdgeState; nodes: Map<string, NodeState> }) {
  const a = nodes.get(e.from)
  const b = nodes.get(e.to)
  if (!a || !b) return null
  const hidden = e.hidden || a.hidden || b.hidden
  const { x1, y1, x2, y2 } = endpoints(a, b)
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const gap = 10 / len
  return (
    <g className={styles.edge} data-tone={e.tone} data-dashed={e.dashed ? 'true' : undefined} data-hidden={hidden ? 'true' : undefined}>
      {e.cut ? (
        <>
          <line x1={x1} y1={y1} x2={mx - (x2 - x1) * gap} y2={my - (y2 - y1) * gap} />
          <line x1={mx + (x2 - x1) * gap} y1={my + (y2 - y1) * gap} x2={x2} y2={y2} />
          <text className={styles.cut} x={mx} y={my} dominantBaseline="middle" textAnchor="middle">
            ✕
          </text>
        </>
      ) : (
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
      )}
      {e.label && !e.cut && (
        <text className={styles.edgeLabel} x={mx} y={my - 7} textAnchor="middle">
          {e.label}
        </text>
      )}
    </g>
  )
}

function PacketView({ p, t, nodes }: { p: Packet; t: number; nodes: Map<string, NodeState> }) {
  const a = nodes.get(p.from)
  const b = nodes.get(p.to)
  if (!a || !b) return null
  const { x1, y1, x2, y2 } = endpoints(a, b)
  const k = ease(t)
  const x = x1 + (x2 - x1) * k
  const y = y1 + (y2 - y1) * k
  return (
    <g className={styles.packet} data-tone={p.tone ?? 'active'} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <circle r={6.5} />
      {p.label && (
        <text y={-12} textAnchor="middle">
          {p.label}
        </text>
      )}
    </g>
  )
}

export default function AnimationPlayer({ scene }: { scene: Scene }) {
  const width = scene.width ?? DEFAULT_WIDTH
  const height = scene.height ?? DEFAULT_HEIGHT
  const last = scene.steps.length - 1
  const reduced = useMemo(prefersReducedMotion, [])

  // Start on the first step's finished frame, so nothing moves until asked.
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(() => stepDuration(scene, 0))
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const clock = useRef({ index: 0, elapsed: stepDuration(scene, 0), held: 0 })

  const duration = stepDuration(scene, index)
  const step = scene.steps[index]

  const goTo = useCallback(
    (i: number, animate: boolean) => {
      const next = Math.max(0, Math.min(last, i))
      const start = animate && !reduced ? 0 : stepDuration(scene, next)
      clock.current = { index: next, elapsed: start, held: 0 }
      setIndex(next)
      setElapsed(start)
    },
    [last, reduced, scene],
  )

  // One animation loop: move packets, then (while playing) hold and advance.
  useEffect(() => {
    const animating = elapsed < duration
    if (!animating && !playing) return
    let frame = 0
    let prev = performance.now()
    const tick = (now: number) => {
      const dt = (now - prev) * speed
      prev = now
      const c = clock.current
      const d = stepDuration(scene, c.index)
      if (c.elapsed < d) {
        c.elapsed = Math.min(d, c.elapsed + dt)
        setElapsed(c.elapsed)
      } else if (playing) {
        c.held += dt
        if (c.held >= holdDuration(scene.steps[c.index].caption)) {
          if (c.index >= last) {
            setPlaying(false)
            return
          }
          goTo(c.index + 1, true)
          return
        }
      } else {
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [elapsed, duration, playing, speed, scene, last, goTo, index])

  const arrived = elapsed >= duration
  const { nodes, edges } = stateAt(scene, index, arrived)
  const packets = (step.packets ?? [])
    .map((p) => ({ p, t: (elapsed - (p.phase ?? 0) * PHASE_MS) / PHASE_MS }))
    .filter(({ t }) => t > 0 && t < 1)

  const togglePlay = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (index >= last && arrived) goTo(0, true)
    else if (arrived) goTo(index + 1, true)
    setPlaying(true)
  }

  return (
    <div className={styles.player}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${scene.title}. Step ${index + 1} of ${last + 1}: ${step.caption}`}
      >
        {scene.decor?.map((d, i) =>
          d.type === 'ring' ? (
            <circle key={i} className={styles.ring} cx={d.cx} cy={d.cy} r={d.r} />
          ) : d.type === 'region' ? (
            <g key={i} className={styles.region}>
              <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={6} />
              <text x={d.x + 8} y={d.y + 14}>
                {d.label}
              </text>
            </g>
          ) : (
            <text key={i} className={styles.decorText} x={d.x} y={d.y} textAnchor="middle">
              {d.text}
            </text>
          ),
        )}
        {[...edges.values()].map((e) => (
          <EdgeView key={edgeKey(e)} e={e} nodes={nodes} />
        ))}
        {[...nodes.values()].map((n) => (
          <NodeView key={n.id} n={n} />
        ))}
        {packets.map(({ p, t }, i) => (
          <PacketView key={i} p={p} t={t} nodes={nodes} />
        ))}
      </svg>

      <div className={styles.captionRow}>
        <span className={styles.stepCount}>
          {index + 1} / {last + 1}
        </span>
        <p className={styles.caption} aria-live="polite">
          {step.caption}
        </p>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.control} onClick={() => { setPlaying(false); goTo(0, false) }} aria-label="Restart">
          <RestartIcon width={18} height={18} />
        </button>
        <button type="button" className={styles.control} onClick={() => { setPlaying(false); goTo(index - 1, false) }} disabled={index === 0} aria-label="Previous step">
          <ArrowLeftIcon width={18} height={18} />
        </button>
        <button type="button" className={`${styles.control} ${styles.play}`} onClick={togglePlay}>
          {playing ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
          <span>{playing ? 'Pause' : index >= last && arrived ? 'Replay' : 'Play'}</span>
        </button>
        <button type="button" className={styles.control} onClick={() => { setPlaying(false); goTo(index + 1, true) }} disabled={index === last} aria-label="Next step">
          <ArrowRightIcon width={18} height={18} />
        </button>
        <button
          type="button"
          className={`${styles.control} ${styles.speed}`}
          onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
          aria-label={`Playback speed ${speed}×`}
        >
          {speed}×
        </button>
      </div>
    </div>
  )
}
