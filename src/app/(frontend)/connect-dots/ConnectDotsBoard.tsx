'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Circle, Text, Line, Rect } from 'react-konva'
import type { DotPuzzle, DotPoint } from './puzzles'
import { Button } from '@/components/ui/button'
import { RefreshCw, Undo2, CheckCircle2 } from 'lucide-react'

type ConnectDotsBoardProps = {
  puzzle: DotPuzzle
}

type Segment = {
  from: number
  to: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

export function ConnectDotsBoard({ puzzle }: ConnectDotsBoardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: puzzle.width, height: puzzle.height })
  const [visited, setVisited] = useState<number[]>([puzzle.points[0]?.id ?? 1])
  const [segments, setSegments] = useState<Segment[]>([])
  const [hoverLine, setHoverLine] = useState<number[] | null>(null)

  const expectedNextId = useMemo(() => {
    const nextPoint = puzzle.points[visited.length]
    return nextPoint?.id
  }, [puzzle.points, visited.length])

  const finished = visited.length === puzzle.points.length

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return
      const width = clamp(containerRef.current.clientWidth, 280, 800)
      const aspect = puzzle.height / puzzle.width
      setSize({ width, height: width * aspect })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [puzzle.height, puzzle.width])

  const scaleX = size.width / puzzle.width
  const scaleY = size.height / puzzle.height

  const getPoint = (id: number): DotPoint | undefined => puzzle.points.find((p) => p.id === id)

  const handleSelect = (pointId: number) => {
    if (finished) return

    const nextId = expectedNextId
    if (pointId !== nextId) return

    setSegments((prev) => [...prev, { from: visited[visited.length - 1], to: pointId }])
    setVisited((prev) => [...prev, pointId])
  }

  const handleReset = () => {
    setVisited([puzzle.points[0]?.id ?? 1])
    setSegments([])
  }

  const handleUndo = () => {
    if (visited.length <= 1) return
    setVisited((prev) => prev.slice(0, -1))
    setSegments((prev) => prev.slice(0, -1))
  }

  const handlePointerMove = (point: DotPoint) => {
    if (finished) {
      setHoverLine(null)
      return
    }
    const nextId = expectedNextId
    if (point.id !== nextId) {
      setHoverLine(null)
      return
    }
    const lastPoint = getPoint(visited[visited.length - 1])
    if (!lastPoint) return
    setHoverLine([
      lastPoint.x * scaleX,
      lastPoint.y * scaleY,
      point.x * scaleX,
      point.y * scaleY,
    ])
  }

  const clearHoverLine = () => setHoverLine(null)

  const segmentsWithCoords = segments
    .map((seg) => {
      const from = getPoint(seg.from)
      const to = getPoint(seg.to)
      if (!from || !to) return null
      return {
        from,
        to,
        points: [from.x * scaleX, from.y * scaleY, to.x * scaleX, to.y * scaleY],
      }
    })
    .filter(Boolean) as { from: DotPoint; to: DotPoint; points: number[] }[]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={handleReset} size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Alusta uuesti
        </Button>
        <Button variant="ghost" onClick={handleUndo} size="sm" className="gap-2" disabled={visited.length <= 1}>
          <Undo2 className="h-4 w-4" />
          Samm tagasi
        </Button>
        {finished && (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            Valmis!
          </div>
        )}
      </div>

      <div ref={containerRef} className="w-full max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-sm">
        <Stage width={size.width} height={size.height} style={{ backgroundColor: 'transparent' }}>
          <Layer>
            <Rect
              x={0}
              y={0}
              width={size.width}
              height={size.height}
              cornerRadius={24}
              fill="#f8fafc"
            />
            {hoverLine && (
              <Line
                points={hoverLine}
                stroke="#22c55e"
                strokeWidth={4}
                dash={[10, 8]}
                lineCap="round"
                lineJoin="round"
              />
            )}
            {segmentsWithCoords.map((seg, index) => (
              <Line
                key={`${seg.from.id}-${seg.to.id}-${index}`}
                points={seg.points}
                stroke="#0ea5e9"
                strokeWidth={6}
                lineCap="round"
                lineJoin="round"
                shadowColor="rgba(14,165,233,0.35)"
                shadowBlur={10}
              />
            ))}
            {puzzle.points.map((point) => {
              const x = point.x * scaleX
              const y = point.y * scaleY

              const isVisited = visited.includes(point.id)
              const isNext = point.id === expectedNextId
              const isStart = point.id === visited[0]

              return (
                <React.Fragment key={point.id}>
                  <Circle
                    x={x}
                    y={y}
                    radius={28}
                    fill={isVisited ? '#22c55e' : isNext ? '#0ea5e9' : '#e2e8f0'}
                    stroke={isVisited ? '#15803d' : isNext ? '#0284c7' : '#cbd5e1'}
                    strokeWidth={3}
                    shadowBlur={isNext ? 16 : 10}
                    shadowColor={isNext ? 'rgba(14,165,233,0.6)' : 'rgba(148,163,184,0.35)'}
                    onClick={() => handleSelect(point.id)}
                    onTap={() => handleSelect(point.id)}
                    onMouseMove={() => handlePointerMove(point)}
                    onTouchMove={() => handlePointerMove(point)}
                    onMouseLeave={clearHoverLine}
                    onTouchEnd={clearHoverLine}
                    onMouseEnter={(e) => {
                      const stage = e.target.getStage()
                      if (!stage) return
                      stage.container().style.cursor = 'pointer'
                    }}
                    onMouseLeave={(e) => {
                      const stage = e.target.getStage()
                      if (!stage) return
                      stage.container().style.cursor = 'default'
                    }}
                  />
                  <Circle
                    x={x}
                    y={y}
                    radius={18}
                    fill={isVisited ? '#16a34a' : isNext ? '#0284c7' : '#cbd5e1'}
                    opacity={isVisited ? 0.4 : 0.6}
                    listening={false}
                  />
                  <Text
                    x={x - 7}
                    y={y - 9}
                    text={String(point.id)}
                    fontSize={16}
                    fontStyle="bold"
                    fill="#0f172a"
                    listening={false}
                  />
                  {isStart && (
                    <Text
                      x={x + 32}
                      y={y - 6}
                      text="Alusta siit"
                      fontSize={12}
                      fill="#0ea5e9"
                      listening={false}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
