'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CharacterImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallbackText?: string;
  sizes?: string;
}

export default function CharacterImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  fallbackText = 'Y',
  sizes
}: CharacterImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`${className} bg-primary/10 rounded-lg flex items-center justify-center`}>
        <span className="text-primary font-bold text-lg">{fallbackText}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      onError={() => setHasError(true)}
    />
  );
}
