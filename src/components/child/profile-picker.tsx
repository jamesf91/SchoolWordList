import type { ChildProfile } from '@/types'
import { LABEL_WHO_IS_PRACTISING } from '@/constants/strings'

interface ProfilePickerProps {
  profiles: ChildProfile[]
  onSelect(profile: ChildProfile): void
}

export function ProfilePicker({ profiles, onSelect }: ProfilePickerProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-sky-50 p-8">
      <h2 className="text-3xl font-bold text-sky-800">{LABEL_WHO_IS_PRACTISING}</h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {profiles.map(profile => (
          <button
            key={profile.id}
            onClick={() => onSelect(profile)}
            className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 min-h-32 text-2xl font-bold text-slate-800 shadow-sm ring-1 ring-slate-200 hover:ring-blue-400 hover:bg-blue-50 active:bg-blue-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {profile.name}
          </button>
        ))}
      </div>
    </div>
  )
}
