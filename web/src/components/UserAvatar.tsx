import { useState } from 'react'

export interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  role?: 'platform_admin' | 'admin_studio' | 'admin' | 'manager' | 'pt' | 'client' | string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  shape?: 'rounded-xl' | 'rounded-2xl' | 'rounded-full' | 'rounded-lg'
  className?: string
  showRoleBadge?: boolean
  alt?: string
}

export function getInitials(name: string): string {
  if (!name || !name.trim()) return 'TL'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  const first = parts[0][0] || ''
  const second = parts[1][0] || ''
  return (first + second).toUpperCase()
}

export function UserAvatar({
  name,
  avatarUrl,
  role,
  size = 'md',
  shape = 'rounded-xl',
  className = '',
  showRoleBadge = false,
  alt,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs sm:text-sm',
    lg: 'w-12 h-12 text-sm sm:text-base',
    xl: 'w-14 h-14 text-base sm:text-lg',
    '2xl': 'w-16 h-16 text-lg sm:text-xl',
  }[size]

  // Role-based styling accents
  const getRoleBorderColor = () => {
    switch (role) {
      case 'platform_admin':
        return 'border-amber-400/50 text-amber-400 bg-amber-400/10'
      case 'admin_studio':
      case 'admin':
        return 'border-accent/50 text-accent bg-panel'
      case 'manager':
        return 'border-sky-400/50 text-sky-400 bg-sky-400/10'
      case 'pt':
        return 'border-accent/40 text-accent bg-panel'
      case 'client':
        return 'border-emerald-500/40 text-emerald-400 bg-panel'
      default:
        return 'border-line text-accent bg-panel'
    }
  }

  const roleBorder = getRoleBorderColor()
  const initials = getInitials(name)
  const hasPhoto = Boolean(avatarUrl && avatarUrl.trim() && !imgError)

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`relative overflow-hidden flex items-center justify-center font-bold tracking-wider select-none border transition-all duration-200 ${sizeClasses} ${shape} ${roleBorder} ${className}`}
        title={`${name}${role ? ` (${role})` : ''}`}
      >
        {hasPhoto ? (
          <img
            src={avatarUrl!}
            alt={alt || name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-[inherit] transition-transform hover:scale-105 duration-300"
            loading="lazy"
          />
        ) : (
          <span className="font-extrabold">{initials}</span>
        )}
      </div>

      {showRoleBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-panel ${
            role === 'platform_admin'
              ? 'bg-amber-400'
              : role === 'admin_studio' || role === 'admin'
                ? 'bg-accent'
                : role === 'manager'
                  ? 'bg-sky-400'
                  : role === 'client'
                    ? 'bg-emerald-400'
                    : 'bg-accent'
          }`}
          title={role ? `Role: ${role}` : 'Aktif'}
        />
      )}
    </div>
  )
}
