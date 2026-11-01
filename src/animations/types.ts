// Animated diagrams are written as data: boxes, connections, and steps in
// which "packets" (requests, messages, data) travel between boxes. The player
// in components/AnimationPlayer.tsx renders and plays them.

export type Tone = 'neutral' | 'active' | 'ok' | 'warn' | 'error' | 'muted'

export type Shape = 'rect' | 'cylinder' | 'circle'

/** A small cell drawn inside a box: a queue message, a token, a log entry. */
export type Item = string | { label: string; tone?: Tone }

export interface SceneNode {
  id: string
  x: number
  y: number
  label: string
  /** Second line in smaller text, e.g. a value or a state. */
  sub?: string
  w?: number
  h?: number
  shape?: Shape
  tone?: Tone
  hidden?: boolean
  items?: Item[]
}

export interface SceneEdge {
  from: string
  to: string
  label?: string
  dashed?: boolean
  tone?: Tone
  hidden?: boolean
  /** Draw a break in the line, e.g. a network partition. */
  cut?: boolean
}

export interface Packet {
  from: string
  to: string
  label?: string
  tone?: Tone
  /** Packets in phase 0 move first, then phase 1, and so on, within one step. */
  phase?: number
}

export type NodePatch = Partial<Omit<SceneNode, 'id'>>
export type EdgePatch = Partial<Pick<SceneEdge, 'label' | 'dashed' | 'tone' | 'hidden' | 'cut'>>

export interface Step {
  caption: string
  /** Changes applied when the step starts. */
  set?: Record<string, NodePatch>
  /** Changes applied once this step's packets arrive. */
  after?: Record<string, NodePatch>
  /** Edge changes, keyed "from>to". Applied when the step starts. */
  edges?: Record<string, EdgePatch>
  packets?: Packet[]
}

/** Static background shapes: a hash ring, a labelled region. */
export type Decor =
  | { type: 'ring'; cx: number; cy: number; r: number }
  | { type: 'region'; x: number; y: number; w: number; h: number; label: string }
  | { type: 'text'; x: number; y: number; text: string }

export interface Scene {
  title: string
  width?: number
  height?: number
  decor?: Decor[]
  nodes: SceneNode[]
  edges: SceneEdge[]
  steps: Step[]
}

export const DEFAULT_WIDTH = 420
export const DEFAULT_HEIGHT = 260
