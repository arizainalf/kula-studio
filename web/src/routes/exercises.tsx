import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { api, type User } from '../lib/api'
import { AppLayout } from '../components/AppLayout'
import {
  Dumbbell,
  Plus,
  Search,
  X,
  Trash2,
  Settings,
  FolderPlus,
  Flame,
  Activity,
  HeartPulse,
  Wind,
  ShieldPlus,
  Edit2,
  CheckCircle2,
  AlertCircle,
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
  category_slug: string
  category_name?: string
  name: string
  default_detail?: string | null
  muscle_group?: string | null
  is_favorite: boolean
  is_global: boolean
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

export const Route = createFileRoute('/exercises')({
  beforeLoad: async () => {
    try {
      const res = await api<{ user: User }>('/auth/me')
      if (res.user.role === 'client') {
        throw redirect({ to: '/portal' })
      }
    } catch (e) {
      if (e && typeof e === 'object' && 'to' in e) throw e
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    const [meRes, catRes, exRes] = await Promise.all([
      api<{ user: User }>('/auth/me'),
      api<{ categories: ExerciseCategory[] }>('/exercises/categories').catch(() => ({ categories: [] })),
      api<{ exercises: LibraryExercise[] }>('/exercises').catch(() => ({ exercises: [] })),
    ])

    return {
      currentUser: meRes.user,
      initialCategories: catRes.categories || [],
      initialExercises: exRes.exercises || [],
    }
  },
  component: ExercisesPage,
})

function ExercisesPage() {
  const { currentUser: initialUser, initialCategories, initialExercises } = Route.useLoaderData()
  const [currentUser, setCurrentUser] = useState<User>(initialUser)
  const [categories, setCategories] = useState<ExerciseCategory[]>(initialCategories)
  const [exercises, setExercises] = useState<LibraryExercise[]>(initialExercises)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<LibraryExercise | null>(null)
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false)

  // Feedback messages
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Add Exercise Form State
  const [addCatSlug, setAddCatSlug] = useState('')
  const [addName, setAddName] = useState('')
  const [addMuscle, setAddMuscle] = useState('')
  const [addDetail, setAddDetail] = useState('')
  const [addFavorite, setAddFavorite] = useState(false)
  const [addSubmitting, setAddSubmitting] = useState(false)

  // Edit Exercise Form State
  const [editCatSlug, setEditCatSlug] = useState('')
  const [editName, setEditName] = useState('')
  const [editMuscle, setEditMuscle] = useState('')
  const [editDetail, setEditDetail] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)

  // Add Category Form State
  const [newCatSlug, setNewCatSlug] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('dumbbell')
  const [submittingCat, setSubmittingCat] = useState(false)

  const isAdmin =
    currentUser.role === 'admin_studio' ||
    (currentUser.role as string) === 'admin' ||
    currentUser.role === 'platform_admin'

  async function reloadData() {
    try {
      const [catRes, exRes] = await Promise.all([
        api<{ categories: ExerciseCategory[] }>('/exercises/categories'),
        api<{ exercises: LibraryExercise[] }>('/exercises'),
      ])
      setCategories(catRes.categories || [])
      setExercises(exRes.exercises || [])
    } catch {}
  }

  function handleStartAdd() {
    setErrorMsg('')
    setAddCatSlug(categories[0]?.slug || 'resistance')
    setAddName('')
    setAddMuscle('')
    setAddDetail('')
    setAddFavorite(false)
    setIsAddModalOpen(true)
  }

  function handleStartEdit(ex: LibraryExercise) {
    setEditingExercise(ex)
    setEditCatSlug(ex.category_slug)
    setEditName(ex.name)
    setEditMuscle(ex.muscle_group || '')
    setEditDetail(ex.default_detail || '')
    setErrorMsg('')
  }

  async function handleCreateExercise(e: React.FormEvent) {
    e.preventDefault()
    if (!addName.trim()) return
    setAddSubmitting(true)
    setErrorMsg('')

    try {
      const res = await api<{ exercise: LibraryExercise }>('/exercises', {
        method: 'POST',
        body: JSON.stringify({
          category_slug: addCatSlug,
          name: addName.trim(),
          muscle_group: addMuscle.trim() || undefined,
          default_detail: addDetail.trim() || undefined,
          is_favorite: addFavorite,
        }),
      })

      setExercises((prev) => [res.exercise, ...prev])
      setIsAddModalOpen(false)
      setSuccessMsg(`Gerakan "${addName}" berhasil ditambahkan!`)
      setTimeout(() => setSuccessMsg(''), 3000)
      reloadData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan gerakan.')
    } finally {
      setAddSubmitting(false)
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingExercise) return
    setEditSubmitting(true)
    setErrorMsg('')

    try {
      const res = await api<{ exercise: LibraryExercise }>(`/exercises/${editingExercise.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          category_slug: editCatSlug,
          name: editName.trim(),
          muscle_group: editMuscle.trim() || null,
          default_detail: editDetail.trim() || null,
        }),
      })

      setExercises((prev) =>
        prev.map((item) => (item.id === editingExercise.id ? { ...item, ...res.exercise } : item))
      )
      setEditingExercise(null)
      setSuccessMsg(`Gerakan "${editName}" berhasil diperbarui!`)
      setTimeout(() => setSuccessMsg(''), 3000)
      reloadData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan gerakan.')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDeleteExercise(id: string, name: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus gerakan "${name}"?`)) return

    try {
      await api(`/exercises/${id}`, { method: 'DELETE' })
      setExercises((prev) => prev.filter((item) => item.id !== id))
      setSuccessMsg(`Gerakan "${name}" berhasil dihapus.`)
      setTimeout(() => setSuccessMsg(''), 3000)
      reloadData()
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus gerakan.')
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatSlug.trim() || !newCatName.trim()) return
    setSubmittingCat(true)
    setErrorMsg('')

    try {
      const res = await api<{ category: ExerciseCategory }>('/exercises/categories', {
        method: 'POST',
        body: JSON.stringify({
          slug: newCatSlug.trim().toLowerCase(),
          name: newCatName.trim(),
          description: newCatDesc.trim() || undefined,
          icon: newCatIcon,
        }),
      })

      setCategories((prev) => [...prev, res.category])
      setNewCatSlug('')
      setNewCatName('')
      setNewCatDesc('')
      setSuccessMsg(`Kategori "${newCatName}" berhasil dibuat!`)
      setTimeout(() => setSuccessMsg(''), 3000)
      reloadData()
    } catch (err: any) {
      setErrorMsg(err.message === 'slug_taken' ? 'Slug kategori sudah ada.' : err.message || 'Gagal membuat kategori.')
    } finally {
      setSubmittingCat(false)
    }
  }

  async function handleDeleteCategory(slug: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"? Gerakan yang terkait harus dipindahkan terlebih dahulu.`)) return

    try {
      await api(`/exercises/categories/${slug}`, { method: 'DELETE' })
      setCategories((prev) => prev.filter((c) => c.slug !== slug))
      setSuccessMsg(`Kategori "${name}" berhasil dihapus.`)
      setTimeout(() => setSuccessMsg(''), 3000)
      reloadData()
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kategori.')
    }
  }

  const filteredExercises = exercises.filter((ex) => {
    const matchCat = selectedCategory === 'all' || ex.category_slug === selectedCategory
    const matchSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.muscle_group && ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ex.default_detail && ex.default_detail.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCat && matchSearch
  })

  return (
    <AppLayout
      currentUser={currentUser}
      activeRoute="exercises"
      onProfileUpdated={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
    >
      <main className="flex-1 w-full p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-12">
        <div className="w-full space-y-6 animate-fade-in">
          {/* ── Page Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/40 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  PUSTAKA GERAKAN
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                Master Gerakan Latihan
              </h1>
              <p className="text-xs sm:text-sm text-dim mt-0.5">
                Pustaka gerakan olahraga terstandarisasi untuk pencatatan log latihan harian klien.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin && (
                <button
                  onClick={() => {
                    setErrorMsg('')
                    setIsCategoriesModalOpen(true)
                  }}
                  className="bg-panel hover:bg-panel-elevated text-text border border-line hover:border-accent/40 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 btn-interactive shrink-0"
                >
                  <Settings className="w-3.5 h-3.5 text-dim" />
                  <span>Kelola Kategori</span>
                </button>
              )}

              <button
                onClick={handleStartAdd}
                className="bg-accent hover:bg-accent/90 text-[#141414] font-bold text-xs px-4 py-2.5 rounded-xl shadow-[0_2px_12px_rgba(226,232,0,0.25)] hover:shadow-[0_4px_16px_rgba(226,232,0,0.4)] transition-all flex items-center justify-center gap-2 btn-interactive shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Tambah Gerakan Baru</span>
              </button>
            </div>
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

          {/* ── Search & Category Filter ── */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-panel p-3 sm:p-4 rounded-2xl border border-line">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-dim absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama gerakan, otot target, atau detail rekomendasi..."
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

              <div className="text-xs font-mono text-dim">
                Menampilkan <span className="font-bold text-accent">{filteredExercises.length}</span> dari {exercises.length} gerakan
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar touch-scroll">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === 'all'
                    ? 'bg-accent text-[#141414] shadow-sm font-bold'
                    : 'bg-panel text-dim hover:text-text border border-line'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Semua Kategori ({exercises.length})</span>
              </button>

              {categories.map((c) => {
                const count = exercises.filter((ex) => ex.category_slug === c.slug).length
                const isSelected = selectedCategory === c.slug
                return (
                  <button
                    key={c.slug}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-accent text-[#141414] shadow-sm font-bold'
                        : 'bg-panel text-dim hover:text-text border border-line'
                    }`}
                  >
                    {getCategoryIcon(c.icon)}
                    <span>{c.name} ({count})</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Exercises Table / Cards ── */}
          {filteredExercises.length === 0 ? (
            <div className="p-12 text-center bg-panel border border-line rounded-2xl">
              <Dumbbell className="w-10 h-10 text-dim mx-auto mb-3 opacity-50" />
              <div className="font-bold text-sm text-text">Belum ada gerakan latihan</div>
              <p className="text-xs text-dim mt-1">
                {searchQuery
                  ? 'Tidak ada gerakan yang cocok dengan pencarian.'
                  : 'Klik tombol Tambah Gerakan Baru untuk mengisi pustaka latihan.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
              {filteredExercises.map((ex) => {
                const canEdit = isAdmin || !ex.is_global

                return (
                  <div
                    key={ex.id}
                    className="bg-panel border border-line hover-gold-glow rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-sm transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(
                            categories.find((c) => c.slug === ex.category_slug)?.icon
                          )}
                          <span className="text-[10px] font-mono uppercase tracking-wider text-dim">
                            {ex.category_name || ex.category_slug}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                            ex.is_global
                              ? 'bg-panel text-dim border-line'
                              : 'bg-accent/15 text-accent border-accent/30'
                          }`}
                        >
                          {ex.is_global ? 'Global' : 'Custom'}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-text leading-snug">
                        {ex.name}
                      </h3>

                      {ex.muscle_group && (
                        <div className="text-xs font-mono text-dim">
                          Otot: <span className="text-text font-medium">{ex.muscle_group}</span>
                        </div>
                      )}

                      {ex.default_detail && (
                        <div className="text-[11px] font-mono text-dim bg-bg p-2 rounded-xl border border-line/60">
                          Format: {ex.default_detail}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-line/40">
                      {canEdit && (
                        <button
                          onClick={() => handleStartEdit(ex)}
                          className="p-1.5 rounded-lg bg-bg hover:bg-panel-elevated border border-line hover:border-accent/40 text-dim hover:text-accent transition-all btn-interactive"
                          title="Edit Gerakan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canEdit && (
                        <button
                          onClick={() => handleDeleteExercise(ex.id, ex.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-all btn-interactive"
                          title="Hapus Gerakan"
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
      </main>

      {/* ── Modal: Tambah Gerakan Baru ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(226,232,0,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-bold text-base text-text">Tambah Gerakan Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExercise} className="space-y-4 text-xs">
              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Kategori Gerakan *</label>
                <select
                  value={addCatSlug}
                  onChange={(e) => setAddCatSlug(e.target.value)}
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Nama Gerakan *</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Contoh: Barbell Romanian Deadlift"
                  required
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Target Otot (Opsional)</label>
                <input
                  type="text"
                  value={addMuscle}
                  onChange={(e) => setAddMuscle(e.target.value)}
                  placeholder="Contoh: Hamstrings, Glutes, Lower Back"
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2 text-text outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Format / Rekomendasi</label>
                <input
                  type="text"
                  value={addDetail}
                  onChange={(e) => setAddDetail(e.target.value)}
                  placeholder="Contoh: 3 sets x 10 reps @ RPE 8"
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2 text-text outline-none text-sm font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addFavorite"
                  checked={addFavorite}
                  onChange={(e) => setAddFavorite(e.target.checked)}
                  className="rounded border-line bg-bg text-accent focus:ring-0 w-4 h-4"
                />
                <label htmlFor="addFavorite" className="text-dim cursor-pointer">
                  Tandai sebagai gerakan favorit / rekomendasi utama
                </label>
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
                  disabled={addSubmitting}
                  className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-bold px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 btn-interactive"
                >
                  {addSubmitting ? 'Menyimpan...' : 'Simpan Gerakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Gerakan ── */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(226,232,0,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
              <h3 className="font-bold text-base text-text">Edit Data Gerakan</h3>
              <button
                onClick={() => setEditingExercise(null)}
                className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Kategori Gerakan *</label>
                <select
                  value={editCatSlug}
                  onChange={(e) => setEditCatSlug(e.target.value)}
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Nama Gerakan *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2.5 text-text outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Target Otot (Opsional)</label>
                <input
                  type="text"
                  value={editMuscle}
                  onChange={(e) => setEditMuscle(e.target.value)}
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2 text-text outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-dim block font-mono uppercase mb-1 font-semibold">Format / Rekomendasi</label>
                <input
                  type="text"
                  value={editDetail}
                  onChange={(e) => setEditDetail(e.target.value)}
                  className="w-full bg-bg border border-line focus:border-accent rounded-xl px-3.5 py-2 text-text outline-none text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
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

      {/* ── Modal: Kelola Kategori Gerakan ── */}
      {isCategoriesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fade-in">
          <div className="bg-panel border border-line rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(226,232,0,0.12)] max-h-[90dvh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-base text-text">Kelola Kategori Gerakan</h3>
              </div>
              <button
                onClick={() => setIsCategoriesModalOpen(false)}
                className="text-dim hover:text-text p-1 rounded-lg transition-colors btn-interactive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5 text-xs">
              {/* Add category form */}
              <form onSubmit={handleCreateCategory} className="p-3.5 bg-bg rounded-xl border border-line space-y-3">
                <div className="font-bold text-text uppercase font-mono text-[11px] text-accent">
                  Tambah Kategori Baru
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Nama Kategori *</label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value)
                        setNewCatSlug(
                          e.target.value
                            .toLowerCase()
                            .trim()
                            .replace(/[^a-z0-9\s-]/g, '')
                            .replace(/\s+/g, '-')
                        )
                      }}
                      placeholder="Contoh: Plyometrics"
                      required
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Slug URL *</label>
                    <input
                      type="text"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value.toLowerCase())}
                      placeholder="plyometrics"
                      required
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Ikon Kategori</label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                    >
                      <option value="dumbbell">Dumbbell (Standar)</option>
                      <option value="flame">Flame (Warm-up)</option>
                      <option value="activity">Activity (Cardio)</option>
                      <option value="heart-pulse">Heart Pulse (Conditioning)</option>
                      <option value="wind">Wind (Mobility)</option>
                      <option value="shield-plus">Shield (Rehab)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-dim block font-mono uppercase mb-1">Deskripsi Singkat</label>
                    <input
                      type="text"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Penjelasan kategori..."
                      className="w-full bg-panel border border-line focus:border-accent rounded-xl px-3 py-2 text-text outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingCat}
                  className="w-full py-2 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-50 text-[#141414] font-bold shadow-sm transition-all btn-interactive"
                >
                  {submittingCat ? 'Menyimpan...' : '+ Tambah Kategori'}
                </button>
              </form>

              {/* Categories list */}
              <div>
                <div className="font-bold text-text uppercase font-mono text-[11px] mb-2 text-dim">
                  Daftar Kategori Terpasang ({categories.length})
                </div>

                <div className="divide-y divide-line/40 bg-bg rounded-xl border border-line overflow-hidden">
                  {categories.map((cat) => (
                    <div key={cat.slug} className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-panel border border-line shrink-0">
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-text truncate">{cat.name}</div>
                          <div className="text-[10px] text-dim font-mono">slug: {cat.slug}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-panel border border-line text-dim">
                          {exercises.filter((ex) => ex.category_slug === cat.slug).length} gerakan
                        </span>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteCategory(cat.slug, cat.name)}
                            className="p-1.5 rounded-lg text-dim hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
