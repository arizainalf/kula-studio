import { useState, useEffect } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { api, type User, type Studio } from '../lib/api'
import { AppLayout } from '../components/AppLayout'
import {
  Building2,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  PauseCircle,
  PlayCircle,
  Edit2,
  Phone,
  MapPin,
  UserCheck,
  X,
  Trash2,
  Save,
} from 'lucide-react'

export type PlatformOverview = {
  total_studios: number
  active_studios: number
  suspended_studios: number
  total_admins: number
  total_pts: number
  total_managers: number
  total_clients: number
  total_sessions: number
}

export const Route = createFileRoute('/studios')({
  beforeLoad: async () => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      if (res.user.role !== 'platform_admin') {
        throw redirect({ to: '/' })
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    const [meRes, overviewRes, studiosRes] = await Promise.all([
      api<{ user: User }>('/auth/me'),
      api<{ overview: PlatformOverview }>('/platform/overview').catch(() => ({
        overview: {
          total_studios: 0,
          active_studios: 0,
          suspended_studios: 0,
          total_admins: 0,
          total_pts: 0,
          total_managers: 0,
          total_clients: 0,
          total_sessions: 0,
        },
      })),
      api<{ studios: Studio[] }>('/platform/studios').catch(() => ({ studios: [] })),
    ])

    return {
      currentUser: meRes.user,
      initialOverview: overviewRes.overview,
      initialStudios: studiosRes.studios,
    }
  },
  component: StudiosPage,
})

function StudiosPage() {
  const { currentUser: initialUser, initialOverview, initialStudios } = Route.useLoaderData()
  const [currentUser, setCurrentUser] = useState<User>(initialUser)
  const [overview, setOverview] = useState<PlatformOverview>(initialOverview)
  const [studios, setStudios] = useState<Studio[]>(initialStudios)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('action=new')) {
      setIsAddModalOpen(true)
    }
  }, [])
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null)
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null)
  const [studioStaff, setStudioStaff] = useState<any[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)

  // Alert notices
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Add Studio Form State
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newGmapsUrl, setNewGmapsUrl] = useState('')
  const [newTier, setNewTier] = useState<'starter' | 'standard' | 'pro' | 'enterprise'>('standard')
  const [newExpiry, setNewExpiry] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Edit Studio Form State
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editGmapsUrl, setEditGmapsUrl] = useState('')
  const [editTier, setEditTier] = useState<'starter' | 'standard' | 'pro' | 'enterprise'>('standard')
  const [editExpiry, setEditExpiry] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  async function reloadData() {
    try {
      const [overviewRes, studiosRes] = await Promise.all([
        api<{ overview: PlatformOverview }>('/platform/overview'),
        api<{ studios: Studio[] }>('/platform/studios'),
      ])
      setOverview(overviewRes.overview)
      setStudios(studiosRes.studios || [])
    } catch {}
  }

  function handleNameChange(val: string) {
    setNewName(val)
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    setNewSlug(generated)
  }

  function handleStartEdit(s: Studio) {
    setEditingStudio(s)
    setEditName(s.name)
    setEditSlug(s.slug)
    setEditAddress(s.address || '')
    setEditPhone(s.phone || '')
    setEditGmapsUrl(s.gmaps_url || '')
    setEditTier(s.plan_tier)
    setEditExpiry(s.subscription_expires_at ? s.subscription_expires_at.split('T')[0] : '')
  }

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
      reloadData()
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status studio.')
    }
  }

  async function handleDeleteStudio(s: Studio) {
    if (
      !confirm(
        `PERINGATAN KERAS: Apakah Anda yakin ingin menghapus studio "${s.name}" beserta seluruh data staf dan klien di dalamnya? Tindakan ini permanen!`
      )
    )
      return

    try {
      await api(`/platform/studios/${s.id}`, { method: 'DELETE' })
      setStudios((prev) => prev.filter((item) => item.id !== s.id))
      setSuccessMsg(`Studio "${s.name}" berhasil dihapus dari platform.`)
      setTimeout(() => setSuccessMsg(''), 3000)
      reloadData()
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus studio.')
    }
  }

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
          gmaps_url: newGmapsUrl.trim() || null,
          plan_tier: newTier,
          subscription_expires_at: newExpiry || null,
          admin_name: adminName.trim(),
          admin_email: adminEmail.trim().toLowerCase(),
          admin_password: adminPassword,
        }),
      })

      setSuccessMsg(res.message || 'Studio berhasil ditambahkan!')
      setStudios((prev) => [res.studio, ...prev])
      setIsAddModalOpen(false)
      setNewName('')
      setNewSlug('')
      setNewAddress('')
      setNewPhone('')
      setNewGmapsUrl('')
      setAdminName('')
      setAdminEmail('')
      setAdminPassword('')
      reloadData()
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

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingStudio) return
    setEditSubmitting(true)
    setErrorMsg('')

    try {
      const res = await api<{ studio: Studio }>('/platform/studios/' + editingStudio.id, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim().toLowerCase(),
          address: editAddress.trim() || null,
          phone: editPhone.trim() || null,
          gmaps_url: editGmapsUrl.trim() || null,
          plan_tier: editTier,
          subscription_expires_at: editExpiry || null,
        }),
      })

      setStudios((prev) =>
        prev.map((item) => (item.id === editingStudio.id ? { ...item, ...res.studio } : item))
      )
      setEditingStudio(null)
      setSuccessMsg(`Perubahan studio "${editName}" berhasil disimpan.`)
      setTimeout(() => setSuccessMsg(''), 3000)
      reloadData()
    } catch (err: any) {
      setErrorMsg(
        err.message === 'slug_taken'
          ? 'Slug studio sudah dipakai.'
          : err.message || 'Gagal menyimpan perubahan studio.'
      )
    } finally {
      setEditSubmitting(false)
    }
  }

  const filteredStudios = studios.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.admin_name && s.admin_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.admin_email && s.admin_email.toLowerCase().includes(searchQuery.toLowerCase()))

    if (statusFilter === 'active') return matchesSearch && s.is_active
    if (statusFilter === 'suspended') return matchesSearch && !s.is_active
    return matchesSearch
  })

  return (
    <AppLayout
      currentUser={currentUser}
      activeRoute="studios"
      onAddStudioClick={() => setIsAddModalOpen(true)}
      onProfileUpdated={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
    >
      <main className="flex-1 w-full p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-12">
        <div className="w-full space-y-6 animate-fade-in">
          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/40 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/25 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  SAAS SUPERADMIN
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                Kelola Studio &amp; Multi-Tenant
              </h1>
              <p className="text-xs sm:text-sm text-dim mt-0.5">
                Pantau seluruh studio gym rekanan, kuota paket langganan, dan status operasional.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs px-4 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(226,232,0,0.25)] hover:shadow-[0_4px_16px_rgba(226,232,0,0.4)] transition-all flex items-center justify-center gap-2 btn-interactive shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Studio Baru</span>
            </button>
          </div>

          {/* Alert notifications */}
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

          {/* ── KPI Overview Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-panel border border-line shadow-sm hover-gold-glow">
              <div className="flex items-center justify-between text-dim text-xs mb-2">
                <span className="font-mono uppercase tracking-wider text-[11px]">Total Studio</span>
                <Building2 className="w-4 h-4 text-accent" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-text">
                {overview.total_studios}
              </div>
              <div className="text-[11px] text-dim mt-1">Tenant terdaftar</div>
            </div>

            <div className="p-4 rounded-2xl bg-panel border border-line shadow-sm hover-gold-glow">
              <div className="flex items-center justify-between text-dim text-xs mb-2">
                <span className="font-mono uppercase tracking-wider text-[11px]">Studio Aktif</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                {overview.active_studios}
              </div>
              <div className="text-[11px] text-dim mt-1">Beroperasi normal</div>
            </div>

            <div className="p-4 rounded-2xl bg-panel border border-line shadow-sm hover-gold-glow">
              <div className="flex items-center justify-between text-dim text-xs mb-2">
                <span className="font-mono uppercase tracking-wider text-[11px]">Disuspend</span>
                <PauseCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                {overview.suspended_studios}
              </div>
              <div className="text-[11px] text-dim mt-1">Ditangguhkan</div>
            </div>

            <div className="p-4 rounded-2xl bg-panel border border-line shadow-sm hover-gold-glow">
              <div className="flex items-center justify-between text-dim text-xs mb-2">
                <span className="font-mono uppercase tracking-wider text-[11px]">Total Klien Platform</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-400">
                {overview.total_clients}
              </div>
              <div className="text-[11px] text-dim mt-1">{overview.total_sessions} total sesi latihan</div>
            </div>
          </div>

          {/* ── Search & Filter Controls ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-3 sm:p-4 rounded-2xl border border-line">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama studio, slug, alamat, atau admin..."
                className="w-full bg-bg border border-line focus:border-accent rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-text outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-text p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-accent text-[#141414] shadow-sm'
                    : 'bg-bg text-dim hover:text-text border border-line'
                }`}
              >
                Semua ({studios.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === 'active'
                    ? 'bg-emerald-400 text-black shadow-sm'
                    : 'bg-bg text-dim hover:text-text border border-line'
                }`}
              >
                Aktif ({studios.filter((s) => s.is_active).length})
              </button>
              <button
                onClick={() => setStatusFilter('suspended')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  statusFilter === 'suspended'
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'bg-bg text-dim hover:text-text border border-line'
                }`}
              >
                Disuspend ({studios.filter((s) => !s.is_active).length})
              </button>
            </div>
          </div>

          {/* ── Studio Cards / Table ── */}
          {filteredStudios.length === 0 ? (
            <div className="p-12 text-center bg-panel border border-line rounded-2xl">
              <Building2 className="w-10 h-10 text-dim mx-auto mb-3 opacity-50" />
              <div className="font-bold text-sm text-text">Tidak ada studio ditemukan</div>
              <p className="text-xs text-dim mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudios.map((s) => (
                <div
                  key={s.id}
                  className="bg-panel border border-line hover-gold-glow rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Top Row: Title, Tier & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-text truncate" title={s.name}>
                          {s.name}
                        </h3>
                        <div className="text-[11px] font-mono text-dim mt-0.5">slug: {s.slug}</div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                            s.plan_tier === 'enterprise'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : s.plan_tier === 'pro'
                                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                                : 'bg-accent/15 text-accent border border-accent/25'
                          }`}
                        >
                          {s.plan_tier}
                        </span>

                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            s.is_active
                              ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-emerald-400' : 'bg-rose-500'}`}
                          />
                          {s.is_active ? 'Aktif' : 'Suspended'}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1.5 text-xs text-dim font-mono pt-1">
                      {s.admin_name && (
                        <div className="flex items-center gap-1.5 text-text">
                          <UserCheck className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="truncate">
                            Admin: {s.admin_name} ({s.admin_email})
                          </span>
                        </div>
                      )}
                      {s.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-dim shrink-0" />
                          <span className="truncate">{s.address}</span>
                        </div>
                      )}
                      {s.gmaps_url && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                          <a
                            href={s.gmaps_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent hover:underline text-xs truncate flex items-center gap-1"
                            title="Buka peta Google Maps"
                          >
                            <span>Google Maps &rarr;</span>
                          </a>
                        </div>
                      )}
                      {s.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-dim shrink-0" />
                          <span>{s.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats pills */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/40 text-center">
                      <div className="p-2 rounded-xl bg-bg border border-line/50">
                        <div className="text-[10px] font-mono text-dim uppercase">Trainer (PT)</div>
                        <div className="font-bold text-sm text-text mt-0.5">{s.pt_count ?? 0}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-bg border border-line/50">
                        <div className="text-[10px] font-mono text-dim uppercase">Klien</div>
                        <div className="font-bold text-sm text-text mt-0.5">{s.client_count ?? 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-line/50">
                    <button
                      onClick={() => handleViewStudioDetail(s)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-bg hover:bg-panel-elevated border border-line hover:border-accent/40 text-xs font-semibold text-text transition-all btn-interactive"
                    >
                      Detail &amp; Staf
                    </button>

                    <button
                      onClick={() => handleStartEdit(s)}
                      className="p-2 rounded-xl bg-bg hover:bg-panel-elevated border border-line hover:border-accent/40 text-dim hover:text-accent transition-all btn-interactive"
                      title="Edit Data Studio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleStudioStatus(s)}
                      className={`p-2 rounded-xl border transition-all btn-interactive ${
                        s.is_active
                          ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border-amber-400/30'
                          : 'bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 border-emerald-400/30'
                      }`}
                      title={s.is_active ? 'Tangguhkan (Suspend)' : 'Aktifkan Kembali'}
                    >
                      {s.is_active ? (
                        <PauseCircle className="w-3.5 h-3.5" />
                      ) : (
                        <PlayCircle className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteStudio(s)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all btn-interactive"
                      title="Hapus Studio Permanen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Modal: Tambah Studio Baru ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(226,232,0,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-base text-text">Daftarkan Studio Gym Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudio} className="space-y-4 text-xs">
              <div className="p-3 bg-bg border border-line/80 rounded-xl space-y-3">
                <div className="font-bold text-text text-sm flex items-center gap-1.5 text-accent">
                  <Building2 className="w-4 h-4" />
                  <span>Informasi Profil Studio</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Nama Studio *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Contoh: PowerGym Jakarta"
                      required
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Slug URL *</label>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                      placeholder="powergym-jakarta"
                      required
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Paket Langganan</label>
                    <select
                      value={newTier}
                      onChange={(e) => setNewTier(e.target.value as any)}
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                    >
                      <option value="starter">STARTER (Basic)</option>
                      <option value="standard">STANDARD</option>
                      <option value="pro">PRO TIER</option>
                      <option value="enterprise">ENTERPRISE</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Masa Berlaku Expired</label>
                    <input
                      type="date"
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Nomor Telepon Studio</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="0812xxxxxxx"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Alamat Studio</label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Jl. Sudirman No. 123"
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-dim block font-mono uppercase mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span>Link Google Maps Studio (URL GMaps)</span>
                    </label>
                    <input
                      type="url"
                      value={newGmapsUrl}
                      onChange={(e) => setNewGmapsUrl(e.target.value)}
                      placeholder="https://maps.app.goo.gl/... atau https://maps.google.com/..."
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Akun Admin Studio Awal */}
              <div className="p-3 bg-bg border border-line/80 rounded-xl space-y-3">
                <div className="font-bold text-text text-sm flex items-center gap-1.5 text-accent">
                  <UserCheck className="w-4 h-4" />
                  <span>Akun Administrator Studio Awal</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Nama Admin Studio *</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      required
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Email Login Admin *</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@powergym.com"
                      required
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1">Password Login Awal *</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                    className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-dim hover:text-text btn-interactive"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 btn-interactive"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Daftarkan Studio Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Studio ── */}
      {editingStudio && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(226,232,0,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
              <h3 className="font-bold text-base text-text">Edit Informasi Studio</h3>
              <button
                onClick={() => setEditingStudio(null)}
                className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-dim block font-mono uppercase mb-1">Nama Studio *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1">Slug URL *</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                  required
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-dim block font-mono uppercase mb-1">Paket Langganan</label>
                  <select
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value as any)}
                    className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                  >
                    <option value="starter">STARTER</option>
                    <option value="standard">STANDARD</option>
                    <option value="pro">PRO TIER</option>
                    <option value="enterprise">ENTERPRISE</option>
                  </select>
                </div>

                <div>
                  <label className="text-dim block font-mono uppercase mb-1">Masa Berlaku Expired</label>
                  <input
                    type="date"
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                    className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1">Alamat Studio</label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>Link Google Maps Studio (URL GMaps)</span>
                </label>
                <input
                  type="url"
                  value={editGmapsUrl}
                  onChange={(e) => setEditGmapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/... atau https://maps.google.com/..."
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingStudio(null)}
                  className="px-4 py-2 rounded-xl text-dim hover:text-text btn-interactive"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-bold px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 btn-interactive"
                >
                  {editSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Detail & Staf Studio ── */}
      {selectedStudio && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(226,232,0,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
              <div>
                <h3 className="font-bold text-base text-text">{selectedStudio.name}</h3>
                <p className="text-xs text-dim font-mono">slug: {selectedStudio.slug}</p>
              </div>
              <button
                onClick={() => setSelectedStudio(null)}
                className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-bg rounded-xl border border-line/70 space-y-1.5 text-xs">
                <div className="text-dim font-mono uppercase text-[11px] font-bold">Ringkasan Studio</div>
                <div className="grid grid-cols-2 gap-2 text-text">
                  <div>Tier: <span className="font-bold uppercase text-accent">{selectedStudio.plan_tier}</span></div>
                  <div>Status: <span className="font-bold text-emerald-400">{selectedStudio.is_active ? 'Aktif' : 'Suspended'}</span></div>
                  <div>Telepon: <span>{selectedStudio.phone || '—'}</span></div>
                  <div>Alamat: <span>{selectedStudio.address || '—'}</span></div>
                  {selectedStudio.gmaps_url && (
                    <div className="col-span-2 flex items-center gap-1.5 text-accent pt-1 border-t border-line/40">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <a
                        href={selectedStudio.gmaps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-accent-hover font-mono text-xs flex items-center gap-1"
                      >
                        <span>Buka Lokasi di Google Maps &rarr;</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider font-mono text-dim mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-accent" />
                  <span>Daftar Staf di Studio Ini ({studioStaff.length})</span>
                </h4>

                {loadingStaff ? (
                  <div className="p-6 text-center text-xs text-dim">Memuat data staf...</div>
                ) : studioStaff.length === 0 ? (
                  <div className="p-6 text-center text-xs text-dim bg-bg rounded-xl border border-line/60">
                    Belum ada staf terdaftar di studio ini.
                  </div>
                ) : (
                  <div className="divide-y divide-line/40 bg-bg rounded-xl border border-line/60 overflow-hidden">
                    {studioStaff.map((member: any) => (
                      <div key={member.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="font-semibold text-text truncate">{member.name}</div>
                          <div className="text-[11px] text-dim font-mono truncate">{member.email}</div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel text-accent border border-line uppercase shrink-0">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
