import { useState, useRef } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { AppLayout } from '../components/AppLayout'
import { UserAvatar } from '../components/UserAvatar'
import {
  UserCheck,
  UserPlus,
  Search,
  X,
  Edit2,
  Trash2,
  ShieldCheck,
  Shield,
  KeyRound,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/users')({
  beforeLoad: async () => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      if (
        res.user.role !== 'admin_studio' &&
        res.user.role !== 'manager' &&
        res.user.role !== 'platform_admin'
      ) {
        throw redirect({ to: '/' })
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    const [meRes, staffRes] = await Promise.all([
      api<{ user: User }>('/auth/me'),
      api<{ staff: User[] }>('/staff').catch(() => ({ staff: [] })),
    ])

    return {
      currentUser: meRes.user,
      initialStaff: staffRes.staff || [],
    }
  },
  component: UsersPage,
})

function UsersPage() {
  const { currentUser: initialUser, initialStaff } = Route.useLoaderData()
  const [currentUser, setCurrentUser] = useState<User>(initialUser)
  const [usersList, setUsersList] = useState<User[]>(initialStaff)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin_studio' | 'manager' | 'pt'>('all')

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Feedback messages
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Add User Form State
  const [addName, setAddName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addRole, setAddRole] = useState<'admin_studio' | 'manager' | 'pt'>('pt')
  const [addSpec, setAddSpec] = useState('')
  const [addPlanTier, setAddPlanTier] = useState<'standard' | 'pro'>('standard')
  const [addAvatarUrl, setAddAvatarUrl] = useState('')
  const [addSubmitting, setAddSubmitting] = useState(false)
  const fileInputAddRef = useRef<HTMLInputElement>(null)

  // Edit User Form State
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState<'admin_studio' | 'manager' | 'pt'>('pt')
  const [editSpec, setEditSpec] = useState('')
  const [editPlanTier, setEditPlanTier] = useState<'standard' | 'pro'>('standard')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editPassword, setEditPassword] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const fileInputEditRef = useRef<HTMLInputElement>(null)

  const isAdmin = currentUser.role === 'admin_studio' || currentUser.role === 'platform_admin'

  function handleFileChange(file: File | undefined, setter: (url: string) => void) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar (JPG/PNG/WEBP).')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 360
        let w = img.width
        let h = img.height
        if (w > h) {
          if (w > MAX_SIZE) {
            h = Math.round((h * MAX_SIZE) / w)
            w = MAX_SIZE
          }
        } else {
          if (h > MAX_SIZE) {
            w = Math.round((w * MAX_SIZE) / h)
            h = MAX_SIZE
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, w, h)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setter(compressedDataUrl)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function handleStartEdit(u: User) {
    setEditingUser(u)
    setEditName(u.name)
    setEditEmail(u.email)
    setEditRole(
      u.role === 'admin_studio' || (u.role as string) === 'admin' || (u.role as string) === 'platform_admin'
        ? 'admin_studio'
        : (u.role as any)
    )
    setEditSpec(u.spec || '')
    setEditPlanTier((u.plan_tier as any) || 'standard')
    setEditIsActive(u.is_active ?? true)
    setEditPassword('')
    setEditAvatarUrl(u.avatar_url || '')
    setErrorMsg('')
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return
    setEditSubmitting(true)
    setErrorMsg('')

    try {
      const payload: Record<string, any> = {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        spec: editSpec.trim() || null,
        plan_tier: editPlanTier,
        is_active: editIsActive,
        avatar_url: editAvatarUrl.trim() || null,
      }

      if (isAdmin) {
        payload.role = editRole
      }

      if (editPassword.trim()) {
        payload.password = editPassword.trim()
      }

      const res = await api<{ pt: User }>(`/staff/${editingUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      setUsersList((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.pt } : u)))
      setSuccessMsg(`Data akun ${editName} berhasil diperbarui!`)
      setEditingUser(null)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setErrorMsg(
        err.message === 'email_taken'
          ? 'Email sudah digunakan akun lain.'
          : err.message || 'Gagal menyimpan perubahan akun.'
      )
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setAddSubmitting(true)
    setErrorMsg('')

    try {
      const payload: Record<string, any> = {
        name: addName.trim(),
        email: addEmail.trim().toLowerCase(),
        password: addPassword,
        role: isAdmin ? addRole : 'pt',
        spec: addSpec.trim() || undefined,
        plan_tier: addPlanTier,
        avatar_url: addAvatarUrl.trim() || null,
      }

      const res = await api<{ pt: User }>('/staff/invite', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setUsersList((prev) => [res.pt, ...prev])
      setSuccessMsg(`Akun ${addName} berhasil didaftarkan!`)
      setIsAddUserModalOpen(false)
      setAddName('')
      setAddEmail('')
      setAddPassword('')
      setAddSpec('')
      setAddAvatarUrl('')
      setTimeout(() => setSuccessMsg(''), 3500)
    } catch (err: any) {
      setErrorMsg(
        err.message === 'email_taken'
          ? 'Email ini sudah terdaftar.'
          : err.message || 'Gagal menambahkan akun baru.'
      )
    } finally {
      setAddSubmitting(false)
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus akun "${userName}"? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return
    }

    try {
      await api(`/staff/${userId}`, { method: 'DELETE' })
      setUsersList((prev) => prev.filter((u) => u.id !== userId))
      setSuccessMsg(`Akun "${userName}" berhasil dihapus.`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      alert(
        err.message === 'cannot_delete_self'
          ? 'Anda tidak dapat menghapus akun Anda sendiri!'
          : 'Gagal menghapus akun.'
      )
    }
  }

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.spec && u.spec.toLowerCase().includes(searchTerm.toLowerCase()))

    if (roleFilter === 'admin_studio') {
      return (
        matchesSearch &&
        (u.role === 'admin_studio' || (u.role as string) === 'admin' || (u.role as string) === 'platform_admin')
      )
    }
    if (roleFilter === 'manager') return matchesSearch && u.role === 'manager'
    if (roleFilter === 'pt') return matchesSearch && u.role === 'pt'
    return matchesSearch
  })

  return (
    <AppLayout
      currentUser={currentUser}
      activeRoute="users"
      onProfileUpdated={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
    >
      <main className="flex-1 w-full p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-12">
        <div className="w-full space-y-6 animate-fade-in">
          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/40 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  DIREKTORI STAF
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                Manajemen Akun &amp; Staf
              </h1>
              <p className="text-xs sm:text-sm text-dim mt-0.5">
                Kelola akun administrator, manajer operasional, dan personal trainer di studio gym Anda.
              </p>
            </div>

            <button
              onClick={() => {
                setErrorMsg('')
                setIsAddUserModalOpen(true)
              }}
              className="bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs px-4 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(226,232,0,0.25)] hover:shadow-[0_4px_16px_rgba(226,232,0,0.4)] transition-all flex items-center justify-center gap-2 btn-interactive shrink-0"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Akun Baru</span>
            </button>
          </div>

          {/* Feedback alerts */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-scale-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Search & Role Filters ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-3 sm:p-4 rounded-2xl border border-line">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama staf, email, atau spesialisasi..."
                className="w-full bg-bg border border-line focus:border-accent rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-text outline-none transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-text p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  roleFilter === 'all'
                    ? 'bg-accent text-[#141414] shadow-sm'
                    : 'bg-bg text-dim hover:text-text border border-line'
                }`}
              >
                Semua ({usersList.length})
              </button>
              <button
                onClick={() => setRoleFilter('admin_studio')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  roleFilter === 'admin_studio'
                    ? 'bg-accent text-[#141414] shadow-sm'
                    : 'bg-bg text-dim hover:text-text border border-line'
                }`}
              >
                Admin (
                {
                  usersList.filter(
                    (u) =>
                      u.role === 'admin_studio' ||
                      (u.role as string) === 'admin' ||
                      (u.role as string) === 'platform_admin'
                  ).length
                }
                )
              </button>
              <button
                onClick={() => setRoleFilter('manager')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  roleFilter === 'manager'
                    ? 'bg-sky-400 text-black shadow-sm'
                    : 'bg-bg text-dim hover:text-text border border-line'
                }`}
              >
                Manager ({usersList.filter((u) => u.role === 'manager').length})
              </button>
              <button
                onClick={() => setRoleFilter('pt')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  roleFilter === 'pt'
                    ? 'bg-accent text-[#141414] shadow-sm'
                    : 'bg-bg text-dim hover:text-text border border-line'
                }`}
              >
                Personal Trainer ({usersList.filter((u) => u.role === 'pt').length})
              </button>
            </div>
          </div>

          {/* ── Users Table / Cards ── */}
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center bg-panel border border-line rounded-2xl">
              <UserCheck className="w-10 h-10 text-dim mx-auto mb-3 opacity-50" />
              <div className="font-bold text-sm text-text">Tidak ada pengguna ditemukan</div>
              <p className="text-xs text-dim mt-1">Coba sesuaikan kata kunci pencarian atau filter role.</p>
            </div>
          ) : (
            <div className="bg-panel rounded-2xl border border-line shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-bg/60 text-[11px] font-mono text-dim uppercase tracking-wider">
                      <th className="py-3 px-4">Pengguna</th>
                      <th className="py-3 px-4">Role &amp; Akses</th>
                      <th className="py-3 px-4">Spesialisasi / Tier</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 text-xs">
                    {filteredUsers.map((u) => {
                      const isSuper = u.role === 'platform_admin'
                      const isStudioAdmin = u.role === 'admin_studio' || (u.role as string) === 'admin'
                      const isManager = u.role === 'manager'

                      return (
                        <tr key={u.id} className="hover:bg-bg/40 transition-colors">
                          {/* User Avatar + Name + Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={u.name}
                                avatarUrl={u.avatar_url}
                                role={u.role}
                                size="md"
                                shape="rounded-xl"
                                showRoleBadge
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-text truncate">{u.name}</div>
                                <div className="text-[11px] text-dim font-mono truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 uppercase ${
                                isSuper
                                  ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                                  : isStudioAdmin
                                    ? 'bg-accent/15 text-accent border border-accent/30'
                                    : isManager
                                      ? 'bg-sky-400/15 text-sky-400 border border-sky-400/30'
                                      : 'bg-panel-elevated text-dim border border-line'
                              }`}
                            >
                              {isSuper ? (
                                <ShieldCheck className="w-3 h-3 text-amber-400" />
                              ) : isStudioAdmin ? (
                                <Shield className="w-3 h-3 text-accent" />
                              ) : isManager ? (
                                <Shield className="w-3 h-3 text-sky-400" />
                              ) : (
                                <UserCheck className="w-3 h-3 text-dim" />
                              )}
                              <span>{u.role.replace('_', ' ')}</span>
                            </span>
                          </td>

                          {/* Spec / Tier */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              {u.spec ? (
                                <div className="text-text font-medium">{u.spec}</div>
                              ) : (
                                <div className="text-dim text-[11px]">—</div>
                              )}
                              <div className="text-[10px] font-mono text-dim uppercase">
                                Tier: {u.plan_tier || 'standard'}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                u.is_active ?? true
                                  ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.is_active ?? true ? 'bg-emerald-400' : 'bg-rose-500'
                                }`}
                              />
                              {u.is_active ?? true ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>

                          {/* Action buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEdit(u)}
                                className="p-1.5 rounded-lg bg-bg hover:bg-panel-elevated border border-line hover:border-accent/40 text-dim hover:text-accent transition-all btn-interactive"
                                title="Edit Akun"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {u.id !== currentUser.id && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all btn-interactive"
                                  title="Hapus Akun"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Modal: Tambah Akun Baru ── */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-base text-text">Tambah Akun Staf Baru</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              {/* Avatar Uploader Section */}
              <div className="p-3.5 rounded-xl bg-bg border border-line/70 space-y-3">
                <label className="text-dim font-semibold block font-mono uppercase text-[11px] flex items-center justify-between">
                  <span>Foto Profil (Avatar)</span>
                  <span className="text-[10px] text-accent lowercase">
                    {addAvatarUrl ? 'Foto Terpasang' : 'Fallback ke Inisial Nama'}
                  </span>
                </label>

                <div className="flex items-center gap-3.5">
                  <div className="relative group">
                    <UserAvatar
                      name={addName || 'Baru'}
                      avatarUrl={addAvatarUrl}
                      role={addRole}
                      size="lg"
                      showRoleBadge
                    />
                    {addAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAddAvatarUrl('')}
                        className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputAddRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={(e) => handleFileChange(e.target.files?.[0], setAddAvatarUrl)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputAddRef.current?.click()}
                        className="btn-interactive px-3 py-1.5 rounded-lg bg-panel hover:bg-panel-elevated border border-line hover:border-accent/40 text-text text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5 text-accent" />
                        <span>Upload Foto</span>
                      </button>

                      {addAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAddAvatarUrl('')}
                          className="btn-interactive px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      value={addAvatarUrl.startsWith('data:') ? '' : addAvatarUrl}
                      onChange={(e) => setAddAvatarUrl(e.target.value)}
                      placeholder="Atau tempel link URL foto..."
                      className="w-full bg-panel border border-line focus:border-accent rounded-lg px-3 py-1.5 text-text outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Nama Lengkap *</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  required
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Alamat Email *</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="rian@gym.com"
                  required
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                  Password Login Awal *
                </label>
                <input
                  type="password"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isAdmin ? (
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                      Peran / Role Pengguna
                    </label>
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value as any)}
                      className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                    >
                      <option value="pt">Personal Trainer (PT)</option>
                      <option value="manager">Manager Operasional</option>
                      <option value="admin_studio">Admin Studio Gym</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">Peran</label>
                    <div className="p-2.5 bg-bg rounded-xl border border-line text-xs font-mono text-dim">
                      Personal Trainer (PT)
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Paket Langganan</label>
                  <select
                    value={addPlanTier}
                    onChange={(e) => setAddPlanTier(e.target.value as any)}
                    className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                  >
                    <option value="standard">STANDARD</option>
                    <option value="pro">PRO TIER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                  Spesialisasi Pelatih (Khusus Role PT)
                </label>
                <input
                  type="text"
                  value={addSpec}
                  onChange={(e) => setAddSpec(e.target.value)}
                  placeholder="Contoh: Fat Loss, Bodybuilding, Rehab"
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-dim hover:text-text btn-interactive"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 btn-interactive"
                >
                  {addSubmitting ? 'Mendaftarkan...' : 'Daftarkan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Akun ── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
              <h3 className="font-bold text-base text-text">Edit Profil Akun Pengguna</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Avatar Uploader Section */}
              <div className="p-3.5 rounded-xl bg-bg border border-line/70 space-y-3">
                <label className="text-dim font-semibold block font-mono uppercase text-[11px] flex items-center justify-between">
                  <span>Foto Profil (Avatar)</span>
                  <span className="text-[10px] text-accent lowercase">
                    {editAvatarUrl ? 'Foto Terpasang' : 'Fallback ke Inisial Nama'}
                  </span>
                </label>

                <div className="flex items-center gap-3.5">
                  <div className="relative group">
                    <UserAvatar
                      name={editName || 'User'}
                      avatarUrl={editAvatarUrl}
                      role={editRole}
                      size="lg"
                      showRoleBadge
                    />
                    {editAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setEditAvatarUrl('')}
                        className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md"
                        title="Hapus foto"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputEditRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={(e) => handleFileChange(e.target.files?.[0], setEditAvatarUrl)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputEditRef.current?.click()}
                        className="btn-interactive px-3 py-1.5 rounded-lg bg-panel hover:bg-panel-elevated border border-line hover:border-accent/40 text-text text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5 text-accent" />
                        <span>Upload Foto</span>
                      </button>

                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl('')}
                          className="btn-interactive px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>

                    <input
                      type="url"
                      value={editAvatarUrl.startsWith('data:') ? '' : editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      placeholder="Atau tempel link URL foto..."
                      className="w-full bg-panel border border-line focus:border-accent rounded-lg px-3 py-1.5 text-text outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Nama Lengkap *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Alamat Email *</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isAdmin ? (
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                      Peran / Role Pengguna
                    </label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                    >
                      <option value="pt">Personal Trainer (PT)</option>
                      <option value="manager">Manager Operasional</option>
                      <option value="admin_studio">Admin Studio Gym</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">Peran</label>
                    <div className="p-2.5 bg-bg rounded-xl border border-line text-xs font-mono text-dim uppercase">
                      {editRole}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Paket Langganan</label>
                  <select
                    value={editPlanTier}
                    onChange={(e) => setEditPlanTier(e.target.value as any)}
                    className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                  >
                    <option value="standard">STANDARD</option>
                    <option value="pro">PRO TIER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                  Spesialisasi Pelatih (Khusus Role PT)
                </label>
                <input
                  type="text"
                  value={editSpec}
                  onChange={(e) => setEditSpec(e.target.value)}
                  placeholder="Contoh: Fat Loss, Muscle Gain"
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                />
              </div>

              {/* Password Reset */}
              <div className="p-3.5 rounded-xl bg-bg border border-line/70 space-y-2">
                <label className="text-accent font-semibold font-mono uppercase text-[11px] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Password (Opsional)</span>
                </label>
                <p className="text-[10px] text-dim">
                  Kosongkan kolom jika tidak ingin mereset password akun ini.
                </p>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Ketik password baru jika ingin mereset"
                  className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2 text-text outline-none text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-dim hover:text-text btn-interactive"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 btn-interactive"
                >
                  {editSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
