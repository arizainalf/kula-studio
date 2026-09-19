import { useState, useEffect, useRef } from 'react'
import { api, type User } from '../lib/api'
import { UserAvatar, getInitials } from './UserAvatar'
import {
  X,
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Search,
  KeyRound,
  Save,
  RefreshCw,
  Camera,
  Upload,
} from 'lucide-react'

interface AdminUsersModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
}

export function AdminUsersModal({
  isOpen,
  onClose,
  currentUser,
}: AdminUsersModalProps) {
  const [usersList, setUsersList] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin_studio' | 'manager' | 'pt'>('all')

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null)
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

  // Add User State
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [addName, setAddName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addRole, setAddRole] = useState<'admin_studio' | 'manager' | 'pt'>('pt')
  const [addSpec, setAddSpec] = useState('')
  const [addPlanTier, setAddPlanTier] = useState<'standard' | 'pro'>('standard')
  const [addAvatarUrl, setAddAvatarUrl] = useState('')
  const [addSubmitting, setAddSubmitting] = useState(false)
  const fileInputAddRef = useRef<HTMLInputElement>(null)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

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

  async function loadUsers() {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await api<{ staff: User[] }>('/staff')
      setUsersList(res.staff || [])
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat daftar pengguna.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadUsers()
      setEditingUser(null)
      setIsAddingUser(false)
      setErrorMsg('')
      setSuccessMsg('')
    }
  }, [isOpen])

  function handleStartEdit(u: User) {
    setEditingUser(u)
    setEditName(u.name)
    setEditEmail(u.email)
    setEditRole((u.role === 'admin_studio' || (u.role as string) === 'admin' || (u.role as string) === 'platform_admin' ? 'admin_studio' : u.role) as any)
    setEditSpec(u.spec || '')
    setEditPlanTier((u.plan_tier as any) || 'standard')
    setEditIsActive(u.is_active ?? true)
    setEditPassword('')
    setEditAvatarUrl(u.avatar_url || '')
    setErrorMsg('')
    setSuccessMsg('')
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return
    setEditSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

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

      if (editPassword) {
        if (editPassword.length < 6) {
          throw new Error('Password baru minimal 6 karakter.')
        }
        payload.password = editPassword
      }

      const res = await api<{ pt: User }>(`/staff/${editingUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      setUsersList((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.pt } : u))
      )
      setSuccessMsg(`Akun ${editName} berhasil diperbarui!`)
      setEditingUser(null)
      setTimeout(() => setSuccessMsg(''), 3500)
    } catch (err: any) {
      setErrorMsg(err.message === 'email_taken' ? 'Email ini sudah terdaftar.' : err.message || 'Gagal menyimpan perubahan.')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    setAddSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (addPassword.length < 6) {
        throw new Error('Password minimal 6 karakter.')
      }

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
      setIsAddingUser(false)
      setAddName('')
      setAddEmail('')
      setAddPassword('')
      setAddSpec('')
      setAddAvatarUrl('')
      setTimeout(() => setSuccessMsg(''), 3500)
    } catch (err: any) {
      setErrorMsg(err.message === 'email_taken' ? 'Email ini sudah terdaftar.' : err.message || 'Gagal menambahkan akun baru.')
    } finally {
      setAddSubmitting(false)
    }
  }

  async function handleDeleteUser(userId: string, userName: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    try {
      await api(`/staff/${userId}`, { method: 'DELETE' })
      setUsersList((prev) => prev.filter((u) => u.id !== userId))
      setSuccessMsg(`Akun "${userName}" berhasil dihapus.`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      alert(err.message === 'cannot_delete_self' ? 'Anda tidak dapat menghapus akun Anda sendiri!' : 'Gagal menghapus akun.')
    }
  }

  if (!isOpen) return null

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.spec && u.spec.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchesSearch) return false
    if (roleFilter === 'all') return true
    return u.role === roleFilter
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-panel border border-line rounded-2xl w-full max-w-4xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.12)] max-h-[90dvh] flex flex-col animate-scale-in">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg border border-accent/40 flex items-center justify-center text-accent shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-text">Manajemen &amp; Edit Akun Pengguna</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-dim">Kelola profil, peran hak akses, reset password, dan status akun</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-dim hover:text-text p-1.5 rounded-lg border border-transparent hover:border-line transition-colors btn-interactive"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Feedback Banners */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fade-in shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in shrink-0">
            <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Sub-view: Edit Form */}
        {editingUser ? (
          <div className="mt-4 flex-1 overflow-y-auto pr-1 animate-fade-in">
            <div className="p-4 rounded-xl bg-bg border border-accent/30 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-accent" />
                <h4 className="font-bold text-sm text-text">
                  Edit Profil Akun: <span className="text-accent">{editingUser.name}</span>
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-xs text-dim hover:text-text btn-interactive font-mono"
              >
                &larr; Kembali ke Daftar Akun
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Avatar Photo Section */}
              <div className="p-3.5 rounded-xl bg-bg border border-line/70 space-y-2.5">
                <label className="text-dim block font-mono uppercase text-[11px] font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-accent">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Foto Profil Akun</span>
                  </span>
                  <span className="text-[10px] text-dim font-normal">
                    Fallback: inisial ({getInitials(editName)})
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
                      placeholder={editAvatarUrl.startsWith('data:') ? 'Foto diupload dari perangkat' : 'Atau tempel URL foto (https://...)'}
                      className="w-full bg-panel border border-line focus:border-accent rounded-lg px-2.5 py-1.5 text-[11px] text-text placeholder:text-muted outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Nama Pengguna</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Role Pengguna</label>
                  {isAdmin ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                    >
                      <option value="pt">Personal Trainer (PT)</option>
                      <option value="manager">Manager Studio</option>
                      <option value="admin_studio">Admin Studio</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-panel border border-line rounded-xl text-dim font-mono uppercase text-xs">
                      {editRole}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Status Akun</label>
                  <select
                    value={editIsActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditIsActive(e.target.value === 'active')}
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                  >
                    <option value="active">Aktif (Dapat Login)</option>
                    <option value="inactive">Nonaktif (Suspended)</option>
                  </select>
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Paket Langganan</label>
                  <select
                    value={editPlanTier}
                    onChange={(e) => setEditPlanTier(e.target.value as any)}
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
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
                  placeholder="Contoh: Strength & Conditioning, Fat Loss"
                  className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                />
              </div>

              {/* Reset Password by Admin */}
              <div className="p-3.5 rounded-xl bg-bg border border-line/70 space-y-2">
                <label className="text-accent font-semibold font-mono uppercase text-[11px] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset / Ganti Password Pengguna Ini (Opsional)</span>
                </label>
                <p className="text-[11px] text-dim">
                  Kosongkan kolom ini jika tidak ingin mereset password akun pengguna.
                </p>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Ketik password baru (min 6 karakter)"
                  className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2 text-text outline-none text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-dim hover:text-text text-xs btn-interactive"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-semibold px-5 py-2.5 rounded-xl text-xs shadow-[0_2px_12px_rgba(226,232,0,0.25)] hover:shadow-[0_4px_16px_rgba(226,232,0,0.4)] transition-all flex items-center gap-1.5 btn-interactive"
                >
                  {editSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan Akun</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : isAddingUser ? (
          /* Sub-view: Add User Form */
          <div className="mt-4 flex-1 overflow-y-auto pr-1 animate-fade-in">
            <div className="p-4 rounded-xl bg-bg border border-accent/30 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-accent" />
                <h4 className="font-bold text-sm text-text">Daftarkan Akun Pengguna Baru</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingUser(false)}
                className="text-xs text-dim hover:text-text btn-interactive font-mono"
              >
                &larr; Kembali ke Daftar Akun
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              {/* Avatar Photo Section */}
              <div className="p-3.5 rounded-xl bg-bg border border-line/70 space-y-2.5">
                <label className="text-dim block font-mono uppercase text-[11px] font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-accent">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Foto Profil Akun</span>
                  </span>
                  <span className="text-[10px] text-dim font-normal">
                    Fallback: inisial ({getInitials(addName)})
                  </span>
                </label>

                <div className="flex items-center gap-3.5">
                  <div className="relative group">
                    <UserAvatar
                      name={addName || 'User'}
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
                      placeholder={addAvatarUrl.startsWith('data:') ? 'Foto diupload dari perangkat' : 'Atau tempel URL foto (https://...)'}
                      className="w-full bg-panel border border-line focus:border-accent rounded-lg px-2.5 py-1.5 text-[11px] text-text placeholder:text-muted outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="Nama pelatih / staf"
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="nama@dev.local"
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Password Akun</label>
                  <input
                    type="password"
                    required
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2 text-text outline-none text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Role Pengguna</label>
                  {isAdmin ? (
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value as any)}
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                    >
                      <option value="pt">Personal Trainer (PT)</option>
                      <option value="manager">Manager Studio</option>
                      <option value="admin_studio">Admin Studio</option>
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-panel border border-line rounded-xl text-dim font-mono uppercase text-xs">
                      Personal Trainer (PT)
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Paket Langganan</label>
                  <select
                    value={addPlanTier}
                    onChange={(e) => setAddPlanTier(e.target.value as any)}
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                  >
                    <option value="standard">STANDARD</option>
                    <option value="pro">PRO TIER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                  Spesialisasi (Opsional)
                </label>
                <input
                  type="text"
                  value={addSpec}
                  onChange={(e) => setAddSpec(e.target.value)}
                  placeholder="Contoh: Strength & Hypertrophy"
                  className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="px-4 py-2 rounded-xl text-dim hover:text-text text-xs btn-interactive"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addSubmitting}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-semibold px-5 py-2.5 rounded-xl text-xs shadow-[0_2px_12px_rgba(226,232,0,0.25)] hover:shadow-[0_4px_16px_rgba(226,232,0,0.4)] transition-all flex items-center gap-1.5 btn-interactive"
                >
                  {addSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></span>
                      <span>Menambahkan...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Buat Akun Pengguna</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Main Table View */
          <div className="mt-4 flex-1 flex flex-col min-h-0 space-y-3">
            {/* Toolbar: Search, Filters & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama, email, atau spesialisasi..."
                    className="w-full bg-bg border border-line focus:border-accent rounded-xl pl-8 pr-3 py-1.5 text-xs text-text outline-none transition-colors"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-text"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-bg p-1 rounded-xl border border-line text-xs font-mono shrink-0">
                  <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      roleFilter === 'all' ? 'bg-panel text-accent font-bold' : 'text-dim hover:text-text'
                    }`}
                  >
                    Semua ({usersList.length})
                  </button>
                  <button
                    onClick={() => setRoleFilter('pt')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      roleFilter === 'pt' ? 'bg-panel text-accent font-bold' : 'text-dim hover:text-text'
                    }`}
                  >
                    PT
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setRoleFilter('manager')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          roleFilter === 'manager' ? 'bg-panel text-accent font-bold' : 'text-dim hover:text-text'
                        }`}
                      >
                        Manager
                      </button>
                      <button
                        onClick={() => setRoleFilter('admin_studio')}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          roleFilter === 'admin_studio' ? 'bg-panel text-accent font-bold' : 'text-dim hover:text-text'
                        }`}
                      >
                        Admin Studio
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadUsers}
                  className="p-2 rounded-xl bg-bg border border-line text-dim hover:text-accent transition-colors btn-interactive"
                  title="Muat Ulang"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingUser(true)}
                  className="bg-accent hover:bg-accent/90 text-[#141414] font-semibold text-xs px-3.5 py-2 rounded-xl shadow-[0_2px_10px_rgba(226,232,0,0.25)] transition-all flex items-center gap-1.5 btn-interactive shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tambah Akun</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="flex-1 overflow-y-auto border border-line rounded-xl bg-bg/50">
              {loading ? (
                <div className="py-16 text-center text-dim text-xs flex flex-col items-center gap-2">
                  <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
                  <span>Memuat daftar akun pengguna...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-dim text-xs">
                  Tidak ada akun yang sesuai dengan filter pencarian.
                </div>
              ) : (
                <div className="divide-y divide-line/60">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser.id
                    return (
                      <div
                        key={u.id}
                        className="p-3.5 sm:p-4 hover:bg-panel/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar
                            name={u.name}
                            avatarUrl={u.avatar_url}
                            role={u.role}
                            size="md"
                            showRoleBadge
                          />

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-text text-sm truncate">{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-accent/20 text-accent font-semibold">
                                  Akun Anda
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                                  u.role === 'admin_studio' || (u.role as string) === 'admin'
                                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                                    : u.role === 'manager'
                                      ? 'bg-sky-400/15 text-sky-300 border border-sky-400/30'
                                      : 'bg-accent/15 text-accent border border-accent/30'
                                }`}
                              >
                                {u.role === 'admin_studio' || (u.role as string) === 'admin' ? 'Admin Studio' : u.role}
                              </span>
                              {u.is_active ? (
                                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Aktif
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                  Nonaktif
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-dim font-mono mt-0.5 flex-wrap">
                              <span className="truncate">{u.email}</span>
                              {u.spec && <span>&bull; {u.spec}</span>}
                              {u.role === 'pt' && (
                                <span className="text-text font-semibold">
                                  &bull; {u.client_count ?? 0} Klien Aktif
                                </span>
                              )}
                              {u.plan_tier && (
                                <span className="text-accent/80 font-bold uppercase">
                                  &bull; {u.plan_tier}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Row Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(u)}
                            className="bg-panel hover:bg-panel-elevated border border-line hover:border-accent/40 text-text text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 btn-interactive font-medium"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-dim" />
                            <span>Edit Akun</span>
                          </button>

                          {isAdmin && !isSelf && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 rounded-xl border border-transparent hover:border-rose-500/40 text-dim hover:text-rose-400 transition-colors btn-interactive"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
