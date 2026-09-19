import { useState, useEffect } from 'react'
import { api, type User } from '../lib/api'
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
