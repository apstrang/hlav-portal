'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CreateEventForm({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [color, setColor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('You must be logged in to create an event.')
      setLoading(false)
      return
    }

    const insertPayload = {
      title,
      starts_at: new Date(start),
      ends_at: new Date(end),
      owned_by: user.id,
      created_by: user.id,
      color,
    }

    const { error: insertError } = await supabase.from('events').insert(insertPayload)

    if (insertError) {
      console.error('Insert error:', insertError)
      setError('Failed to create event.')
    } else {
      setTitle('')
      setStart('')
      setEnd('')
      setColor('')
      onCreated?.() // callback to refresh calendar
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-6 max-w-md">
      <h2 className="font-bold mb-2">Create New Event</h2>
      <input
        type="text"
        placeholder="Title"
        className="block w-full p-2 mb-2 border"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        className="block w-full p-2 mb-2 border"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        required
      />
      <input
        type="datetime-local"
        className="block w-full p-2 mb-2 border"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        required
      />
      <input
        type="color"
        className="block w-full p-2 mb-2 border"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Creating...' : 'Create Event'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  )
}
