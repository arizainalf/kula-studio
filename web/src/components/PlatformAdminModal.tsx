import { useState, useEffect } from 'react'
import { api, type Studio } from '../lib/api'
import {
  Building2,
  X,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Dumbbell,
  PauseCircle,
  PlayCircle,
  Edit2,
  Sparkles,
  RefreshCw,
  Phone,
  MapPin,
  UserCheck,
} from 'lucide-react'

type PlatformOverview = {
  total_studios: number
  active_studios: number
  suspended_studios: number
  total_admins: number
  total_pts: number
  total_managers: number
  total_clients: number
  total_sessions: number
}

export function PlatformAdminModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
  currentUser?: any
}) {
  const [activeTab, setActiveTab] = useState<'studios' | 'new_studio'>('studios')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Overview & Studios data
  const [overview, setOverview] = useState<PlatformOverview | null>(null)
  const [studios, setStudios] = useState<Studio[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')

  // Selected Studio for details or edit
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null)
  const [studioStaff, setStudioStaff] = useState<any[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)

  // Edit Studio State
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editTier, setEditTier] = useState<'starter' | 'standard' | 'pro' | 'enterprise'>('standard')
  const [editExpiry, setEditExpiry] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Form Tambah Studio Baru
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newTier, setNewTier] = useState<'starter' | 'standard' | 'pro' | 'enterprise'>('standard')
  const [newExpiry, setNewExpiry] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load data
  async function loadPlatformData() {
    setLoading(true)
    setErrorMsg('')
    try {
      const [overviewRes, studiosRes] = await Promise.all([
        api<{ overview: PlatformOverview }>('/platform/overview'),
        api<{ studios: Studio[] }>('/platform/studios'),
      ])
      setOverview(overviewRes.overview)
      setStudios(studiosRes.studios || [])
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat data platform.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadPlatformData()
      setActiveTab('studios')
      setSelectedStudio(null)
      setEditingStudio(null)
    }
  }, [isOpen])

  // Generate slug otomatis dari nama
  function handleNameChange(val: string) {
    setNewName(val)
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setNewSlug(generated)
  }

  // Load staff detail for a studio
  async function handleViewStudioDetail(s: Studio) {
    setSelectedStudio(s)
    setLoadingStaff(true)
    try {
      const res = await api<{ studio: Studio; staff: any[]; stats: any }>(`/platform/studios/${s.id}`)
      setStudioStaff(res.staff || [])
    } catch (err) {
      console.error(err)
      setStudioStaff([])
    } finally {
      setLoadingStaff(false)
    }
  }

  // Toggle Suspend Studio
  async function handleToggleStudioStatus(s: Studio) {
    const nextStatus = !s.is_active
    const actionName = nextStatus ? 'mengaktifkan kembali' : 'menangguhkan (suspend)'
    if (!confirm(`Apakah Anda yakin ingin ${actionName} studio "${s.name}"?`)) return

    try {
      await api(`/platform/studios/${s.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: nextStatus }),
      })
      setStudios((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, is_active: nextStatus } : item))
      )
      setSuccessMsg(`Status studio "${s.name}" berhasil diubah.`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status studio.')
    }
  }

  // Submit Studio Baru
  async function handleCreateStudio(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await api<{ studio: Studio; admin: any; message: string }>('/platform/studios', {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          slug: newSlug.trim().toLowerCase(),
          address: newAddress.trim() || null,
          phone: newPhone.trim() || null,
          plan_tier: newTier,
          subscription_expires_at: newExpiry || null,
          admin_name: adminName.trim(),
          admin_email: adminEmail.trim().toLowerCase(),
          admin_password: adminPassword,
        }),
      })

      setSuccessMsg(res.message || 'Studio berhasil ditambahkan!')
      setStudios((prev) => [res.studio, ...prev])
      setNewName('')
      setNewSlug('')
      setNewAddress('')
      setNewPhone('')
      setAdminName('')
      setAdminEmail('')
      setAdminPassword('')
      setActiveTab('studios')
      loadPlatformData()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setErrorMsg(
        err.message === 'slug_taken'
          ? 'Slug studio ini sudah dipakai. Gunakan slug lain.'
          : err.message === 'email_taken'
            ? 'Email admin studio ini sudah terdaftar di sistem.'
            : err.message || 'Gagal mendaftarkan studio baru.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit Studio
  function startEditStudio(s: Studio) {
    setEditingStudio(s)
    setEditName(s.name)
    setEditSlug(s.slug)
    setEditAddress(s.address || '')
    setEditPhone(s.phone || '')
    setEditTier(s.plan_tier)
    setEditExpiry(s.subscription_expires_at ? s.subscription_expires_at.slice(0, 10) : '')
  }

  async function handleSaveEditStudio(e: React.FormEvent) {
    e.preventDefault()
    if (!editingStudio) return
    setEditSubmitting(true)
    setErrorMsg('')

    try {
      const res = await api<{ studio: Studio }>(`/platform/studios/${editingStudio.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim().toLowerCase(),
          address: editAddress.trim() || null,
          phone: editPhone.trim() || null,
          plan_tier: editTier,
          subscription_expires_at: editExpiry || null,
        }),
      })

      setStudios((prev) =>
        prev.map((item) => (item.id === editingStudio.id ? { ...item, ...res.studio } : item))
      )
      setEditingStudio(null)
      setSuccessMsg(`Studio "${editName}" berhasil diperbarui!`)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err: any) {
      setErrorMsg(err.message === 'slug_taken' ? 'Slug studio sudah dipakai.' : err.message || 'Gagal menyimpan perubahan.')
    } finally {
      setEditSubmitting(false)
    }
  }

  if (!isOpen) return null

  const filteredStudios = studios.filter((s) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      (s.admin_name && s.admin_name.toLowerCase().includes(q)) ||
      (s.admin_email && s.admin_email.toLowerCase().includes(q))
    if (!matchesSearch) return false
    if (statusFilter === 'active') return s.is_active
    if (statusFilter === 'suspended') return !s.is_active
    return true
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-panel border border-line rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between bg-panel-elevated/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-text tracking-tight">
                  Manajemen Platform Multi-Tenant (SaaS)
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded-full">
                  PLATFORM ADMIN
                </span>
              </div>
              <p className="text-xs text-dim mt-0.5">
                Kelola seluruh studio gym, alokasi lisensi, status langganan, dan akun Admin Studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-dim hover:text-text hover:bg-bg rounded-xl transition-colors btn-interactive"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifikasi Sukses / Error */}
        {successMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-line shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('studios')
              setSelectedStudio(null)
              setEditingStudio(null)
            }}
            className={`px-3 py-2 text-xs font-mono font-semibold rounded-t-lg transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'studios'
                ? 'border-accent text-accent bg-panel-elevated/40'
                : 'border-transparent text-dim hover:text-text'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Daftar Studio Gym ({studios.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('new_studio')
              setSelectedStudio(null)
              setEditingStudio(null)
            }}
            className={`px-3 py-2 text-xs font-mono font-semibold rounded-t-lg transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'new_studio'
                ? 'border-accent text-accent bg-panel-elevated/40'
                : 'border-transparent text-dim hover:text-text'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Studio Baru</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'studios' ? (
            <>
              {/* Metrik Keseluruhan Platform */}
              {overview && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-panel border border-line flex flex-col justify-between">
                    <span className="text-[11px] font-mono uppercase text-dim flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-accent" /> Total Studio
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl sm:text-2xl font-bold font-mono text-text">
                        {overview.total_studios}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {overview.active_studios} Aktif
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-panel border border-line flex flex-col justify-between">
                    <span className="text-[11px] font-mono uppercase text-dim flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-sky-400" /> Admin Studio
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-text mt-1">
                      {overview.total_admins}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-panel border border-line flex flex-col justify-between">
                    <span className="text-[11px] font-mono uppercase text-dim flex items-center gap-1">
                      <Dumbbell className="w-3 h-3 text-accent" /> Total PT
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-text mt-1">
                      {overview.total_pts}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-panel border border-line flex flex-col justify-between">
                    <span className="text-[11px] font-mono uppercase text-dim flex items-center gap-1">
                      <Users className="w-3 h-3 text-accent" /> Total Klien
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-text mt-1">
                      {overview.total_clients}
                    </span>
                  </div>
                </div>
              )}

              {/* Sub-view: Edit Studio Modal / View */}
              {editingStudio ? (
                <div className="p-4 sm:p-5 rounded-xl bg-panel-elevated/50 border border-accent/40 animate-fade-in space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-accent" />
                      <h4 className="font-bold text-sm text-text">
                        Edit Informasi Studio: <span className="text-accent">{editingStudio.name}</span>
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingStudio(null)}
                      className="text-xs font-mono text-dim hover:text-text btn-interactive"
                    >
                      &larr; Batalkan Edit
                    </button>
                  </div>

                  <form onSubmit={handleSaveEditStudio} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-dim block font-mono uppercase mb-1 font-semibold">Nama Studio</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-dim block font-mono uppercase mb-1 font-semibold">Slug Studio (ID Unik)</label>
                        <input
                          type="text"
                          required
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                          className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="text-dim block font-mono uppercase mb-1 font-semibold">Paket Langganan</label>
                        <select
                          value={editTier}
                          onChange={(e) => setEditTier(e.target.value as any)}
                          className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2.5 text-text outline-none text-sm"
                        >
                          <option value="starter">Starter (Max 3 PT)</option>
                          <option value="standard">Standard (Max 10 PT)</option>
                          <option value="pro">Pro (Max 25 PT)</option>
                          <option value="enterprise">Enterprise (Unlimited PT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-dim block font-mono uppercase mb-1 font-semibold">Masa Aktif Lisensi</label>
                        <input
                          type="date"
                          value={editExpiry}
                          onChange={(e) => setEditExpiry(e.target.value)}
                          className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-dim block font-mono uppercase mb-1 font-semibold">Nomor Telepon / WA</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-dim block font-mono uppercase mb-1 font-semibold">Alamat Studio</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Contoh: Jl. Sudirman No. 12, Jakarta"
                        className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingStudio(null)}
                        className="px-4 py-2 rounded-xl border border-line text-dim hover:text-text btn-interactive text-xs font-mono"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={editSubmitting}
                        className="px-5 py-2 rounded-xl bg-accent text-[#141414] font-bold btn-interactive text-xs font-mono shadow-md disabled:opacity-50"
                      >
                        {editSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {/* Sub-view: Detail Staf Studio */}
              {selectedStudio && !editingStudio ? (
                <div className="p-4 sm:p-5 rounded-xl bg-panel-elevated/50 border border-accent/40 animate-fade-in space-y-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-accent" />
                      <div>
                        <h4 className="font-bold text-sm text-text">
                          Staf di Studio: <span className="text-accent">{selectedStudio.name}</span>
                        </h4>
                        <span className="text-[11px] font-mono text-dim">
                          Slug: {selectedStudio.slug} · Tier: {selectedStudio.plan_tier.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudio(null)}
                      className="text-xs font-mono text-dim hover:text-text btn-interactive"
                    >
                      &larr; Tutup Detail Staf
                    </button>
                  </div>

                  {loadingStaff ? (
                    <div className="py-6 text-center text-xs font-mono text-dim">Memuat data staf studio...</div>
                  ) : studioStaff.length === 0 ? (
                    <div className="py-6 text-center text-xs font-mono text-dim">Belum ada staf terdaftar di studio ini.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {studioStaff.map((st) => (
                        <div key={st.id} className="p-3 rounded-xl bg-panel border border-line flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text">{st.name}</span>
                              <span
                                className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                                  st.role === 'admin_studio' || (st.role as string) === 'admin'
                                    ? 'bg-accent/15 text-accent border border-accent/25'
                                    : st.role === 'manager'
                                      ? 'bg-sky-400/20 text-sky-400 border border-sky-400/30'
                                      : 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                                }`}
                              >
                                {st.role === 'admin_studio' || (st.role as string) === 'admin' ? 'Admin Studio' : st.role}
                              </span>
                            </div>
                            <div className="text-dim font-mono text-[11px] mt-0.5">{st.email}</div>
                          </div>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              st.is_active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-400'
                            }`}
                            title={st.is_active ? 'Akun Aktif' : 'Non-aktif'}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Filter & Toolbar Studio List */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari studio, slug, atau email admin..."
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl pl-9 pr-3.5 py-2 text-xs text-text outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <div className="flex bg-panel border border-line rounded-xl p-0.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        statusFilter === 'all' ? 'bg-panel-elevated text-accent font-bold' : 'text-dim hover:text-text'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('active')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        statusFilter === 'active' ? 'bg-panel-elevated text-emerald-400 font-bold' : 'text-dim hover:text-text'
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('suspended')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        statusFilter === 'suspended' ? 'bg-panel-elevated text-rose-400 font-bold' : 'text-dim hover:text-text'
                      }`}
                    >
                      Suspend
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={loadPlatformData}
                    className="p-2 rounded-xl bg-panel border border-line text-dim hover:text-accent transition-colors btn-interactive"
                    title="Segarkan Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* List Cards of Studios */}
              {loading && studios.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-dim">Memuat data studio...</div>
              ) : filteredStudios.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-panel border border-line text-dim">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-muted" />
                  <p className="text-sm font-bold text-text">Tidak ada studio yang cocok dengan pencarian.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {filteredStudios.map((s) => {
                    const isSuspended = !s.is_active
                    return (
                      <div
                        key={s.id}
                        className={`p-4 sm:p-5 rounded-2xl bg-panel border transition-all duration-300 hover-gold-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSuspended ? 'border-rose-500/40 bg-rose-500/5' : 'border-line'
                        }`}
                      >
                        {/* Left: Studio Info */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-extrabold text-sm sm:text-base text-text">{s.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg text-dim border border-line">
                              slug: {s.slug}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                                s.plan_tier === 'enterprise'
                                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                  : s.plan_tier === 'pro'
                                    ? 'bg-accent/15 text-accent border-accent/30'
                                    : 'bg-sky-400/15 text-sky-400 border-sky-400/30'
                              }`}
                            >
                              Tier: {s.plan_tier}
                            </span>
                            {isSuspended ? (
                              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                DITANGGUHKAN (SUSPEND)
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                AKTIF
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-dim flex-wrap font-mono">
                            {s.admin_name && (
                              <span className="flex items-center gap-1 text-text">
                                <UserCheck className="w-3.5 h-3.5 text-accent" />
                                Admin: {s.admin_name} ({s.admin_email})
                              </span>
                            )}
                            {s.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-dim" />
                                {s.phone}
                              </span>
                            )}
                            {s.address && (
                              <span className="flex items-center gap-1 line-clamp-1">
                                <MapPin className="w-3.5 h-3.5 text-dim" />
                                {s.address}
                              </span>
                            )}
                          </div>

                          {/* Stats Counters */}
                          <div className="flex items-center gap-3 pt-1 text-xs font-mono">
                            <span className="text-dim">
                              PT: <strong className="text-text">{s.pt_count || 0}</strong>
                            </span>
                            <span className="text-dim">·</span>
                            <span className="text-dim">
                              Klien: <strong className="text-text">{s.client_count || 0}</strong>
                            </span>
                            <span className="text-dim">·</span>
                            <span className="text-dim">
                              Sesi: <strong className="text-text">{s.session_count || 0}</strong>
                            </span>
                            {s.subscription_expires_at && (
                              <>
                                <span className="text-dim">·</span>
                                <span className="text-amber-400">
                                  Exp: {s.subscription_expires_at.slice(0, 10)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-line/40 justify-end">
                          <button
                            type="button"
                            onClick={() => handleViewStudioDetail(s)}
                            className="px-3 py-1.5 rounded-xl border border-line hover:border-accent/40 text-dim hover:text-text text-xs font-mono btn-interactive transition-colors"
                          >
                            Detail Staf
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditStudio(s)}
                            className="p-2 rounded-xl border border-line hover:border-accent/40 text-dim hover:text-accent text-xs font-mono btn-interactive transition-colors"
                            title="Edit Studio"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStudioStatus(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 btn-interactive transition-colors border ${
                              isSuspended
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                            }`}
                            title={isSuspended ? 'Aktifkan Kembali Studio' : 'Tangguhkan Studio'}
                          >
                            {isSuspended ? (
                              <>
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>Aktifkan</span>
                              </>
                            ) : (
                              <>
                                <PauseCircle className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            /* Tab: Tambah Studio Baru */
            <form onSubmit={handleCreateStudio} className="space-y-5 animate-fade-in text-xs max-w-2xl mx-auto">
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-text">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="font-bold text-sm">Pendaftaran Studio Gym Baru</span>
                </div>
                <p className="text-dim text-xs">
                  Sistem akan otomatis membuatkan tenant studio baru dan meng-generate akun <strong>Admin Studio</strong> pertama sebagai pemilik gym tersebut.
                </p>
              </div>

              {/* Data Studio */}
              <div className="space-y-3">
                <h4 className="font-mono uppercase font-bold text-accent text-xs">1. Informasi Studio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                      Nama Studio <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Contoh: Iron Gym Jakarta"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                      Slug URL / Identifier <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                      placeholder="iron-gym-jakarta"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">Paket Langganan</label>
                    <select
                      value={newTier}
                      onChange={(e) => setNewTier(e.target.value as any)}
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2.5 text-text outline-none text-sm"
                    >
                      <option value="starter">Starter (Max 3 PT)</option>
                      <option value="standard">Standard (Max 10 PT)</option>
                      <option value="pro">Pro (Max 25 PT)</option>
                      <option value="enterprise">Enterprise (Unlimited PT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">Masa Aktif Lisensi</label>
                    <input
                      type="date"
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">Nomor Telepon Studio</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1 font-semibold">Alamat Studio</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Alamat lengkap gedung / studio gym"
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                  />
                </div>
              </div>

              {/* Data Akun Admin Studio Awal */}
              <div className="space-y-3 pt-3 border-t border-line">
                <h4 className="font-mono uppercase font-bold text-accent text-xs">2. Akun Login Admin Studio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                      Nama Admin <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                      Email Admin <span className="text-accent">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@irongym.com"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1 font-semibold">
                      Password Login <span className="text-accent">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setActiveTab('studios')}
                  className="px-4 py-2.5 rounded-xl border border-line text-dim hover:text-text font-mono text-xs btn-interactive"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-accent text-[#141414] font-extrabold font-mono text-xs btn-interactive shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mendaftarkan Studio...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Daftarkan Studio Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
