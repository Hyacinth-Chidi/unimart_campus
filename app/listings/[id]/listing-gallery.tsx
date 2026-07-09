"use client"

import { useState } from "react"
import Image from "next/image"
import { PackageOpenIcon } from "lucide-react"

interface ListingGalleryProps {
  images: string[]
  title: string
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center border border-dashed">
        <PackageOpenIcon className="size-16 text-muted-foreground/30" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted border">
        <Image
          src={images[activeIndex]}
          alt={title}
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-lg bg-muted border-2 transition-all ${
                activeIndex === index
                  ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
