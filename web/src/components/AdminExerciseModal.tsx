import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import {
  X,
  Plus,
  Trash2,
  Settings,
  FolderPlus,
  Dumbbell,
  Shield,
  Check,
  Flame,
  Activity,
  HeartPulse,
  Wind,
  ShieldPlus,
  RefreshCw,
} from 'lucide-react'

export type ExerciseCategory = {
  slug: string
  name: string
  description?: string | null
  icon?: string | null
  sort_order: number
  exercise_count?: number
}

export type LibraryExercise = {
  id: string
  pt_id?: string | null
  pt_name?: string | null
  category_slug: string
  category_name?: string
  name: string
  default_detail?: string | null
  muscle_group?: string | null
  is_favorite: boolean
  is_global: boolean
}

interface AdminExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  userRole?: string
  onRoleChanged?: () => void
}

function getCategoryIcon(icon?: string | null) {
  switch (icon) {
    case 'flame':
      return <Flame className="w-3.5 h-3.5 text-emerald-400" />
    case 'activity':
      return <Activity className="w-3.5 h-3.5 text-amber-400" />
    case 'heart-pulse':
      return <HeartPulse className="w-3.5 h-3.5 text-sky-400" />
    case 'wind':
      return <Wind className="w-3.5 h-3.5 text-purple-400" />
    case 'shield-plus':
      return <ShieldPlus className="w-3.5 h-3.5 text-teal-400" />
    default:
      return <Dumbbell className="w-3.5 h-3.5 text-accent" />
  }
}

export function AdminExerciseModal({
  isOpen,
  onClose,
  userRole,
  onRoleChanged,
}: AdminExerciseModalProps) {
  const [activeTab, setActiveTab] = useState<'exercises' | 'categories' | 'role'>('exercises')
  const [categories, setCategories] = useState<ExerciseCategory[]>([])
  const [exercises, setExercises] = useState<LibraryExercise[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // New Category Form
  const [newCatSlug, setNewCatSlug] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('dumbbell')
  const [isAddingCat, setIsAddingCat] = useState(false)

  // New Exercise Form
  const [newExCat, setNewExCat] = useState('resistance')
  const [newExName, setNewExName] = useState('')
  const [newExDetail, setNewExDetail] = useState('')
  const [newExMuscle, setNewExMuscle] = useState('')
  const [newExGlobal, setNewExGlobal] = useState(true)
  const [isAddingEx, setIsAddingEx] = useState(false)

  // Role toggle loading
  const [roleLoading, setRoleLoading] = useState(false)

  // Fetch categories & exercises
  useEffect(() => {
    if (!isOpen) return
    loadData()
  }, [isOpen])

  async function loadData() {
    setLoading(true)
    try {
      const [catsRes, exRes] = await Promise.all([
        api<{ categories: ExerciseCategory[] }>('/exercises/categories'),
        api<{ exercises: LibraryExercise[] }>('/exercises'),
      ])
      setCategories(catsRes.categories || [])
      setExercises(exRes.exercises || [])
      if (catsRes.categories?.length > 0 && !newExCat) {
        setNewExCat(catsRes.categories[0].slug)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/exercises/categories', {
        method: 'POST',
        body: JSON.stringify({
          slug: newCatSlug.toLowerCase().trim(),
          name: newCatName.trim(),
          description: newCatDesc.trim() || undefined,
          icon: newCatIcon,
          sort_order: categories.length + 1,
        }),
      })
      setNewCatSlug('')
      setNewCatName('')
      setNewCatDesc('')
      setIsAddingCat(false)
      setMsg('Kategori berhasil ditambahkan.')
      setTimeout(() => setMsg(''), 3000)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menambah kategori.')
    }
  }

  async function handleDeleteCategory(slug: string) {
    if (!confirm(`Hapus kategori "${slug}"? Semua gerakan di dalamnya akan ikut terhapus.`)) return
    try {
      await api(`/exercises/categories/${slug}`, { method: 'DELETE' })
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus kategori.')
    }
  }

  async function handleCreateExercise(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api('/exercises', {
        method: 'POST',
        body: JSON.stringify({
          category_slug: newExCat,
          name: newExName.trim(),
          default_detail: newExDetail.trim() || undefined,
          muscle_group: newExMuscle.trim() || undefined,
          is_global: newExGlobal,
        }),
      })
      setNewExName('')
      setNewExDetail('')
      setNewExMuscle('')
      setIsAddingEx(false)
      setMsg('Gerakan berhasil ditambahkan ke library.')
      setTimeout(() => setMsg(''), 3000)
      loadData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menambah gerakan.')
    }
  }

  async function handleDeleteExercise(id: string) {
    if (!confirm('Hapus gerakan ini dari library?')) return
    try {
      await api(`/exercises/${id}`, { method: 'DELETE' })
      setExercises((prev) => prev.filter((x) => x.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus gerakan.')
    }
  }

  async function handleToggleAdminRole() {
    setRoleLoading(true)
    try {
      const res = await api<{ user: { role: string }; message: string }>('/auth/toggle-admin', {
        method: 'POST',
      })
      alert(res.message || 'Peran akun berhasil diubah.')
      if (onRoleChanged) onRoleChanged()
      location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah role.')
    } finally {
      setRoleLoading(false)
    }
  }

  const filteredExercises = exercises.filter((ex) => {
    if (selectedCategory !== 'all' && ex.category_slug !== selectedCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        ex.name.toLowerCase().includes(q) ||
        (ex.default_detail && ex.default_detail.toLowerCase().includes(q)) ||
        (ex.muscle_group && ex.muscle_group.toLowerCase().includes(q))
      )
    }
    return true
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-panel border border-line w-full max-w-3xl rounded-2xl p-5 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.8)] space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-text">Manajemen Master Gerakan &amp; Admin</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent text-[#141414] uppercase">
                  {userRole || 'Admin'}
                </span>
              </div>
              <p className="text-xs text-dim">Kelola katalog gerakan studio, kategori latihan, dan peran akun</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-bg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-line pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`btn-interactive text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'exercises'
                ? 'bg-accent text-[#141414] font-bold shadow-sm'
                : 'bg-bg text-dim hover:text-text border border-line'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Master Gerakan ({exercises.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`btn-interactive text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-accent text-[#141414] font-bold shadow-sm'
                : 'bg-bg text-dim hover:text-text border border-line'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Kategori Latihan ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('role')}
            className={`btn-interactive text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'role'
                ? 'bg-accent text-[#141414] font-bold shadow-sm'
                : 'bg-bg text-dim hover:text-text border border-line'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan Akun &amp; Role</span>
          </button>

          {loading && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-dim font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
              <span>Sinkronisasi...</span>
            </span>
          )}
        </div>

        {msg && (
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        {/* ── TAB 1: MASTER GERAKAN ── */}
        {activeTab === 'exercises' && (
          <div className="space-y-4 animate-fade-in">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Cari gerakan atau kelompok otot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-bg border border-line rounded-xl px-3 py-1.5 text-xs text-text outline-none focus:border-accent w-full sm:max-w-xs"
                />

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-bg border border-line rounded-xl px-3 py-1.5 text-xs text-text outline-none focus:border-accent"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingEx(!isAddingEx)}
                className="btn-interactive text-xs font-bold px-3 py-1.5 rounded-xl bg-accent text-[#141414] flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tambah Gerakan Baru</span>
              </button>
            </div>

            {/* Add Exercise Form Drawer */}
            {isAddingEx && (
              <form
                onSubmit={handleCreateExercise}
                className="p-4 rounded-xl bg-bg border border-accent/40 space-y-3 animate-fade-in"
              >
                <div className="font-bold text-xs text-accent">Tambah Gerakan Baru ke Library</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-dim block mb-1 font-mono uppercase">Nama Gerakan</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bulgarian Split Squat"
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-text outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="text-dim block mb-1 font-mono uppercase">Kategori</label>
                    <select
                      value={newExCat}
                      onChange={(e) => setNewExCat(e.target.value)}
                      className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-text outline-none focus:border-accent"
                    >
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-dim block mb-1 font-mono uppercase">Detail / Rekomendasi Reps</label>
                    <input
                      type="text"
                      placeholder="Contoh: 3 set x 10 reps @ 16kg"
                      value={newExDetail}
                      onChange={(e) => setNewExDetail(e.target.value)}
                      className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-text outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-dim block mb-1 font-mono uppercase">Target Otot (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: quads, glutes"
                      value={newExMuscle}
                      onChange={(e) => setNewExMuscle(e.target.value)}
                      className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-text outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newExGlobal}
                      onChange={(e) => setNewExGlobal(e.target.checked)}
                      className="rounded accent-accent"
                    />
                    <span>Jadikan Gerakan Bawaan Global (Tersedia untuk Semua Pelatih)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingEx(false)}
                      className="px-3 py-1.5 text-xs text-dim hover:text-text"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold rounded-lg bg-accent text-[#141414]"
                    >
                      Simpan Gerakan
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Exercises List Table */}
            <div className="border border-line rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-bg border-b border-line text-[11px] font-mono text-dim uppercase">
                    <th className="py-2.5 px-3">Nama Gerakan</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Rekomendasi Set/Rep</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/40">
                  {filteredExercises.map((ex) => (
                    <tr key={ex.id} className="hover:bg-bg/40">
                      <td className="py-2.5 px-3 font-medium text-text">
                        <span>{ex.name}</span>
                        {ex.muscle_group && (
                          <span className="block text-[10px] text-dim font-mono">{ex.muscle_group}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-dim font-mono capitalize">
                        {ex.category_slug}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-dim">
                        {ex.default_detail || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            ex.is_global
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                          title={ex.is_global ? 'Gerakan Global Studio' : `Gerakan Custom oleh ${ex.pt_name || 'PT'}`}
                        >
                          {ex.is_global ? 'Global' : ex.pt_name ? `Custom (${ex.pt_name.split(' ')[0]})` : 'Custom PT'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteExercise(ex.id)}
                          className="p-1 rounded text-dim hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus Gerakan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: KATEGORI LATIHAN ── */}
        {activeTab === 'categories' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text">Daftar Kategori Latihan</h3>
                <p className="text-xs text-dim">Kelompok fase latihan untuk menstrukturkan menu latihan klien</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingCat(!isAddingCat)}
                className="btn-interactive text-xs font-bold px-3 py-1.5 rounded-xl bg-accent text-[#141414] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Tambah Kategori Baru</span>
              </button>
            </div>

            {/* Add Category Form */}
            {isAddingCat && (
              <form
                onSubmit={handleCreateCategory}
                className="p-4 rounded-xl bg-bg border border-accent/40 space-y-3 animate-fade-in text-xs"
              >
                <div className="font-bold text-accent">Tambah Kategori Latihan Baru</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block mb-1 font-mono uppercase">Slug / Kode (Unik)</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: mobility, hiit"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-text outline-none focus:border-accent font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-dim block mb-1 font-mono uppercase">Nama Tampilan</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Mobilitas & Kelenturan"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-text outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block mb-1 font-mono uppercase">Deskripsi Ringkas</label>
                    <input
                      type="text"
                      placeholder="misal: Latihan untuk mobilitas & kelenturan sendi"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-text outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-dim block mb-1 font-mono uppercase">Ikon Kategori</label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full bg-panel border border-line rounded-lg px-3 py-2 text-text outline-none focus:border-accent font-mono text-xs"
                    >
                      <option value="dumbbell">Dumbbell (Beban / Resistance)</option>
                      <option value="flame">Flame (Pemanasan / Warmup)</option>
                      <option value="activity">Activity (Core / Stabilitas)</option>
                      <option value="heart-pulse">HeartPulse (Kardio)</option>
                      <option value="wind">Wind (Pendinginan / Relaksasi)</option>
                      <option value="shield-plus">ShieldPlus (Rehab / Mobilitas)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCat(false)}
                    className="px-3 py-1.5 text-xs text-dim hover:text-text"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-accent text-[#141414]"
                  >
                    Simpan Kategori
                  </button>
                </div>
              </form>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.slug}
                  className="p-3.5 rounded-xl bg-bg border border-line flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-panel border border-line shrink-0 mt-0.5">
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-text">{cat.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-panel text-dim border border-line">
                          {cat.slug}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-dim mt-1">{cat.description}</p>
                      )}
                      <span className="text-[10px] text-accent font-mono block mt-2">
                        {cat.exercise_count ?? 0} gerakan terdaftar
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.slug)}
                    className="p-1 text-dim hover:text-rose-400 transition-colors"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: ROLE TOGGLE (AKUN PT BISA JADI ADMIN) ── */}
        {activeTab === 'role' && (
          <div className="space-y-4 animate-fade-in p-4 rounded-xl bg-bg border border-line">
            <div>
              <h3 className="text-sm font-bold text-text">Pengaturan Peran Akun (Role Switcher)</h3>
              <p className="text-xs text-dim mt-0.5">
                Ubah peran akun Anda antara <strong>Pelatih (PT)</strong> dan <strong>Administrator (Admin)</strong> secara instan.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-panel border border-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text">Status Peran Akun Saat Ini:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-accent text-[#141414] uppercase">
                    {userRole || 'pt'}
                  </span>
                </div>
                <p className="text-xs text-dim mt-1.5">
                  {userRole === 'admin'
                    ? 'Akun Admin memiliki wewenang mengelola kategori latihan, direktori staf, dan pengaturan platform.'
                    : 'Akun PT fokus pada manajemen klien, jadwal, dan pencatatan sesi latihan.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleAdminRole}
                disabled={roleLoading}
                className="btn-interactive px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs shadow-sm flex items-center gap-2 shrink-0 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${roleLoading ? 'animate-spin' : ''}`} />
                <span>
                  {userRole === 'admin' ? 'Ubah Menjadi Akun PT' : 'Jadikan Akun Admin'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
