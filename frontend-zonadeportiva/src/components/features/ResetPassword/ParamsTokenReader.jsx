'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ParamsTokenReader({ onToken }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token && onToken) {
      onToken(token)
    }
  }, [searchParams, onToken])

  return null
}
