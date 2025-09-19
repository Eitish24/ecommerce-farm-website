"use client"

import type React from "react"

import Image from "next/image"
import { useState } from "react"

interface ProtectedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  style?: React.CSSProperties
}

export function ProtectedImage({ src, alt, width, height, className, fill, style }: ProtectedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault()
    return false
  }

  return (
    <div
      className="relative select-none"
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={`${className} pointer-events-none select-none`}
        style={{
          ...style,
          userSelect: "none",
          WebkitUserSelect: "none",
          userDrag: "none",
          WebkitUserDrag: "none",
        }}
        onLoad={() => setIsLoading(false)}
        draggable={false}
      />

      {/* Invisible overlay to prevent right-click */}
      <div
        className="absolute inset-0 z-10 bg-transparent"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      />

      {/* Watermark overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-2 right-2 bg-black/20 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          Farm2Home
        </div>
      </div>
    </div>
  )
}
