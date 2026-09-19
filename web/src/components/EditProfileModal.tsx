import { useState, useEffect, useRef } from 'react'
import { api, type User } from '../lib/api'
import { UserAvatar, getInitials } from './UserAvatar'
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Dumbbell,
  Check,
  AlertCircle,
  Save,
  KeyRound,
  HeartPulse,
  Camera,
  Upload,
  Trash2,
} from 'lucide-react'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User
  onProfileUpdated?: (updated: User) => void
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentUser.name || '')
  const [email, setEmail] = useState(currentUser.email || '')
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState(currentUser.phone || '')
  const [spec, setSpec] = useState(currentUser.spec || '')
  const [gender, setGender] = useState<'pria' | 'wanita' | ''>(currentUser.gender || '')
  const [ageBracket, setAgeBracket] = useState(currentUser.age_bracket || '')
  const [problem, setProblem] = useState(currentUser.problem || 'none')
  const [notes, setNotes] = useState(currentUser.notes || '')

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load fresh profile details when modal opens
  useEffect(() => {
    if (!isOpen) return
    setErrorMsg('')
    setSuccessMsg('')
    setPassword('')
    setConfirmPassword('')

    let isMounted = true
    async function fetchFreshProfile() {
      setFetching(true)
      try {
        const res = await api<{ user: User }>('/auth/profile')
        if (!isMounted) return
        const u = res.user
        setName(u.name || '')
        setEmail(u.email || '')
        setAvatarUrl(u.avatar_url || '')
        setPhone(u.phone || '')
        setSpec(u.spec || '')
        setGender((u.gender as any) || '')
        setAgeBracket(u.age_bracket || '')
        setProblem(u.problem || 'none')
        setNotes(u.notes || '')
      } catch (err) {
        // Fallback to currentUser if fetch failed
        setName(currentUser.name || '')
        setEmail(currentUser.email || '')
        setAvatarUrl(currentUser.avatar_url || '')
        setPhone(currentUser.phone || '')
        setSpec(currentUser.spec || '')
      } finally {
        if (isMounted) setFetching(false)
      }
    }

    fetchFreshProfile()
    return () => {
      isMounted = false
    }
  }, [isOpen, currentUser])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
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
        const MAX_SIZE = 160
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
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75)
        setAvatarUrl(compressedDataUrl)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null

  const isClient = currentUser.role === 'client'
  const isPt = currentUser.role === 'pt'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (password) {
      if (password.length < 6) {
        setErrorMsg('Password baru minimal harus 6 karakter.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi password tidak cocok.')
        return
      }
    }

    setLoading(true)
    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar_url: avatarUrl.trim() || null,
      }

      if (password) payload.password = password

      if (isClient) {
        payload.phone = phone.trim() || null
        payload.gender = gender || null
        payload.age_bracket = ageBracket || null
        payload.problem = problem
        payload.notes = notes.trim() || null
      } else if (isPt) {
        payload.spec = spec.trim() || null
      }

      const res = await api<{ user: User; message?: string }>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      setSuccessMsg(res.message || 'Profil berhasil diperbarui!')
      setPassword('')
      setConfirmPassword('')

      if (onProfileUpdated) {
        onProfileUpdated(res.user)
      }

      setTimeout(() => {
        setSuccessMsg('')
      }, 3000)
    } catch (err: any) {
      setErrorMsg(err.message === 'email_taken' ? 'Alamat email ini sudah digunakan oleh akun lain.' : (err.message || 'Gagal memperbarui profil.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
      <div className="bg-panel border border-line rounded-2xl w-full max-w-lg p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.1)] max-h-[90dvh] overflow-y-auto animate-scale-in">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-line mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg border border-accent/40 flex items-center justify-center text-accent shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-text">Edit Profil Akun</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-accent/15 text-accent border border-accent/30">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-dim">Perbarui identitas akun dan informasi login Anda</p>
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

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>{successMsg}</span>
          </div>
        )}

        {fetching ? (
          <div className="py-12 text-center text-dim text-xs flex flex-col items-center gap-2">
            <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></span>
            <span>Memuat data profil...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Field: Foto Profil & Avatar */}
            <div className="p-4 rounded-xl bg-bg border border-line/70 space-y-3">
              <label className="text-dim block font-mono uppercase text-[11px] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-accent">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Foto Profil Akun</span>
                </span>
                <span className="text-[10px] text-dim font-normal">
                  Fallback: inisial nama ({getInitials(name)})
                </span>
              </label>

              <div className="flex items-center gap-4">
                {/* Live Preview using UserAvatar */}
                <div className="relative group">
                  <UserAvatar
                    name={name || 'User'}
                    avatarUrl={avatarUrl}
                    role={currentUser.role}
                    size="xl"
                    showRoleBadge
                  />
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-transform hover:scale-110"
                      title="Hapus foto dan gunakan singkatan nama"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-interactive px-3 py-1.5 rounded-lg bg-panel hover:bg-panel-elevated border border-line hover:border-accent/40 text-text text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 text-accent" />
                      <span>Upload Foto</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="btn-interactive px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium transition-all"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>

                  {/* Direct Image URL input */}
                  <div className="relative">
                    <input
                      type="url"
                      value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder={avatarUrl.startsWith('data:') ? 'Foto diupload dari perangkat' : 'Atau tempel tautan URL foto (https://...)'}
                      className="w-full bg-panel border border-line focus:border-accent rounded-lg px-2.5 py-1.5 text-[11px] text-text placeholder:text-muted outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Preset Avatars */}
              <div className="pt-2 border-t border-line/40">
                <div className="text-[10px] text-dim font-mono mb-1.5">Pilih avatar preset cepat:</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
                    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=256&h=256&q=80',
                    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=256&h=256&q=80',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                        avatarUrl === preset
                          ? 'border-accent ring-2 ring-accent/30 scale-110'
                          : 'border-line hover:border-accent/40 opacity-70 hover:opacity-100'
                      }`}
                      title={`Pilih Avatar #${pIdx + 1}`}
                    >
                      <img src={preset} alt={`Preset ${pIdx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Field: Nama Lengkap */}
            <div>
              <label className="text-dim block font-mono uppercase mb-1 font-semibold flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-accent" />
                <span>Nama Lengkap</span>
                <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm transition-colors"
              />
            </div>

            {/* Field: Email */}
            <div>
              <label className="text-dim block font-mono uppercase mb-1 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>Alamat Email (Akun Login)</span>
                <span className="text-accent">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono transition-colors"
              />
            </div>

            {/* Role Specific Fields: PT Specialization */}
            {isPt && (
              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-accent" />
                  <span>Spesialisasi Pelatih (Trainer Specialization)</span>
                </label>
                <input
                  type="text"
                  value={spec}
                  onChange={(e) => setSpec(e.target.value)}
                  placeholder="Contoh: Strength & Conditioning, Hypertrophy, Fat Loss"
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm transition-colors"
                />
                <p className="text-[10px] text-dim mt-1">
                  Spesialisasi ini ditampilkan pada profil dan kartu klien Anda.
                </p>
              </div>
            )}

            {/* Role Specific Fields: Client Health & Contact Details */}
            {isClient && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-accent" />
                      <span>Nomor WhatsApp / HP</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2 text-text outline-none text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">Jenis Kelamin</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                    >
                      <option value="">-- Pilih Gender --</option>
                      <option value="pria">Pria</option>
                      <option value="wanita">Wanita</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">Kelompok Usia</label>
                    <select
                      value={ageBracket}
                      onChange={(e) => setAgeBracket(e.target.value)}
                      className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                    >
                      <option value="">-- Pilih Usia --</option>
                      <option value="under_20">&lt; 20 tahun</option>
                      <option value="20_29">20 - 29 tahun</option>
                      <option value="30_39">30 - 39 tahun</option>
                      <option value="40_49">40 - 49 tahun</option>
                      <option value="50_plus">&gt; 50 tahun</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-amber-400" />
                      <span>Riwayat Cedera / Masalah</span>
                    </label>
                    <select
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                    >
                      <option value="none">Tidak Ada (Normal &amp; Bugar)</option>
                      <option value="knee">Lutut (Knee)</option>
                      <option value="back">Punggung (Back)</option>
                      <option value="shoulder">Bahu (Shoulder)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Catatan Kebugaran Pribadi / Goal</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tuliskan target kebugaran pribadi atau keluhan khusus Anda"
                    className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2 text-text outline-none text-sm"
                  />
                </div>
              </>
            )}

            {/* Password Change Section (Non-Client / Staff) */}
            {!isClient && (
              <div className="p-3.5 rounded-xl bg-bg border border-line/80 space-y-3 mt-3">
                <div className="flex items-center gap-1.5 text-accent font-semibold font-mono text-[11px] uppercase">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Ganti Password Akun (Opsional)</span>
                </div>
                <p className="text-[11px] text-dim leading-relaxed">
                  Kosongkan kolom di bawah jika Anda tidak ingin mengganti password login saat ini.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 text-[10px]">Password Baru</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 text-[10px]">Konfirmasi Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-line mt-6">
              <div className="text-[11px] text-dim font-mono">
                {currentUser.plan_tier && (
                  <span>Tier: <strong className="text-accent">{currentUser.plan_tier.toUpperCase()}</strong></span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-dim hover:text-text text-xs btn-interactive"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-semibold px-5 py-2.5 rounded-xl text-xs shadow-[0_2px_12px_rgba(226,232,0,0.25)] hover:shadow-[0_4px_16px_rgba(226,232,0,0.4)] transition-all flex items-center gap-1.5 btn-interactive"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Profil</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
