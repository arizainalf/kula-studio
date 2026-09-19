import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Circle,
  Square,
} from 'lucide-react'

export interface ImageCropModalProps {
  isOpen: boolean
  imageSrc: string | null
  title?: string
  aspectRatio?: number // default 1 (1:1)
  cropShape?: 'rect' | 'round'
  maxOutputDimension?: number // default 320
  onCrop: (croppedDataUrl: string, croppedBlob?: Blob) => void
  onClose: () => void
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  title = 'Potong & Sesuaikan Foto (1:1)',
  cropShape = 'rect',
  maxOutputDimension = 320,
  onCrop,
  onClose,
}: ImageCropModalProps) {
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0) // 0, 90, 180, 270
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isRoundMask, setIsRoundMask] = useState<boolean>(cropShape === 'round')
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const initialPinchDistRef = useRef<number | null>(null)
  const initialZoomOnPinchRef = useRef<number>(1)

  const VIEWPORT_SIZE = 300 // 300x300 display square

  // Load image when imageSrc changes or modal opens
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setLoadedImage(null)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setLoadedImage(img)
      setZoom(1)
      setRotation(0)
      setOffset({ x: 0, y: 0 })
    }
    img.src = imageSrc
  }, [isOpen, imageSrc])

  // Compute scale and bounds
  const getRenderMetrics = useCallback(() => {
    if (!loadedImage) return { baseScale: 1, maxOffsetX: 0, maxOffsetY: 0 }

    const isRotatedQuarter = rotation === 90 || rotation === 270
    const effW = isRotatedQuarter ? loadedImage.height : loadedImage.width
    const effH = isRotatedQuarter ? loadedImage.width : loadedImage.height

    const baseScale = Math.max(VIEWPORT_SIZE / effW, VIEWPORT_SIZE / effH)
    const currentScale = baseScale * zoom

    const drawnW = effW * currentScale
    const drawnH = effH * currentScale

    const maxOffsetX = Math.max(0, (drawnW - VIEWPORT_SIZE) / 2)
    const maxOffsetY = Math.max(0, (drawnH - VIEWPORT_SIZE) / 2)

    return { baseScale, maxOffsetX, maxOffsetY }
  }, [loadedImage, rotation, zoom])

  // Draw preview onto canvas whenever image, zoom, rotation, or offset changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !loadedImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { baseScale } = getRenderMetrics()

    ctx.clearRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.save()
    // Move to viewport center + pan offset
    ctx.translate(VIEWPORT_SIZE / 2 + offset.x, VIEWPORT_SIZE / 2 + offset.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(baseScale * zoom, baseScale * zoom)
    ctx.drawImage(
      loadedImage,
      -loadedImage.width / 2,
      -loadedImage.height / 2,
      loadedImage.width,
      loadedImage.height
    )
    ctx.restore()
  }, [loadedImage, zoom, rotation, offset, getRenderMetrics])

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      const { maxOffsetX, maxOffsetY } = getRenderMetrics()
      const nextX = e.clientX - dragStartRef.current.x
      const nextY = e.clientY - dragStartRef.current.y

      setOffset({
        x: Math.max(-maxOffsetX, Math.min(maxOffsetX, nextX)),
        y: Math.max(-maxOffsetY, Math.min(maxOffsetY, nextY)),
      })
    },
    [isDragging, getRenderMetrics]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Touch pan & pinch-zoom handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      dragStartRef.current = {
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      }
    } else if (e.touches.length === 2) {
      setIsDragging(false)
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      initialPinchDistRef.current = dist
      initialZoomOnPinchRef.current = zoom
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const { maxOffsetX, maxOffsetY } = getRenderMetrics()
      const nextX = e.touches[0].clientX - dragStartRef.current.x
      const nextY = e.touches[0].clientY - dragStartRef.current.y

      setOffset({
        x: Math.max(-maxOffsetX, Math.min(maxOffsetX, nextX)),
        y: Math.max(-maxOffsetY, Math.min(maxOffsetY, nextY)),
      })
    } else if (e.touches.length === 2 && initialPinchDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      const scaleFactor = dist / initialPinchDistRef.current
      const newZoom = Math.min(3, Math.max(1, initialZoomOnPinchRef.current * scaleFactor))
      setZoom(newZoom)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    initialPinchDistRef.current = null
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.002
    setZoom((prev) => Math.min(3, Math.max(1, prev + delta)))
  }

  // Reset offset and zoom
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }

  // Rotate clockwise 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
    setOffset({ x: 0, y: 0 })
  }

  // Final Crop & Export
  const handleApply = () => {
    if (!loadedImage) return

    const { baseScale } = getRenderMetrics()
    const outDim = Math.min(maxOutputDimension, Math.max(loadedImage.width, loadedImage.height, 512))
    const ratio = outDim / VIEWPORT_SIZE

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = outDim
    exportCanvas.height = outDim
    const expCtx = exportCanvas.getContext('2d')
    if (!expCtx) return

    expCtx.imageSmoothingEnabled = true
    expCtx.imageSmoothingQuality = 'high'
    expCtx.clearRect(0, 0, outDim, outDim)

    expCtx.save()
    expCtx.translate(outDim / 2 + offset.x * ratio, outDim / 2 + offset.y * ratio)
    expCtx.rotate((rotation * Math.PI) / 180)
    expCtx.scale(baseScale * zoom * ratio, baseScale * zoom * ratio)
    expCtx.drawImage(
      loadedImage,
      -loadedImage.width / 2,
      -loadedImage.height / 2,
      loadedImage.width,
      loadedImage.height
    )
    expCtx.restore()

    const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.82)
    exportCanvas.toBlob(
      (blob) => {
        onCrop(dataUrl, blob || undefined)
        onClose()
      },
      'image/jpeg',
      0.82
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="bg-panel border border-line rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] max-w-md w-full overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-text leading-tight">{title}</h3>
              <p className="text-[11px] text-dim font-mono">Rasio 1:1 Persegi Otomatis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-bg transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="p-4 sm:p-6 flex flex-col items-center bg-bg/40">
          <div
            className="relative overflow-hidden rounded-2xl border-2 border-accent/40 shadow-[0_8px_24px_rgba(0,0,0,0.5)] bg-black touch-none select-none cursor-grab active:cursor-grabbing"
            style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            {/* Real Canvas Preview */}
            <canvas
              ref={canvasRef}
              width={VIEWPORT_SIZE}
              height={VIEWPORT_SIZE}
              className="block pointer-events-none"
            />

            {/* Rule of Thirds Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-accent/20">
              <div className="border-r border-b border-accent/25" />
              <div className="border-r border-b border-accent/25" />
              <div className="border-b border-accent/25" />
              <div className="border-r border-b border-accent/25" />
              <div className="border-r border-b border-accent/25" />
              <div className="border-b border-accent/25" />
              <div className="border-r border-accent/25" />
              <div className="border-r border-accent/25" />
              <div />
            </div>

            {/* Optional Circular Mask View for Avatar */}
            {isRoundMask && (
              <div className="absolute inset-0 pointer-events-none rounded-full ring-[120px] ring-black/75 border-2 border-accent" />
            )}

            {/* Corner Badges */}
            <div className="absolute top-2 left-2 pointer-events-none bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-accent border border-accent/30">
              1:1 SQUARE
            </div>
          </div>

          <p className="text-[11px] text-dim text-center mt-3">
            Geser foto untuk memposisikan &bull; Gulir atau gunakan slider untuk memperbesar
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="p-4 sm:px-6 border-t border-line space-y-3 bg-panel">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1, prev - 0.2))}
              className="p-1.5 rounded-lg bg-bg border border-line text-dim hover:text-text"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-accent h-1.5 bg-line rounded-lg cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
              className="p-1.5 rounded-lg bg-bg border border-line text-dim hover:text-text"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-dim w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRotate}
                className="btn-interactive px-2.5 py-1.5 rounded-lg bg-bg hover:bg-panel-elevated border border-line text-text text-xs font-medium flex items-center gap-1.5 shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5 text-accent" />
                <span>Putar 90&deg;</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn-interactive px-2.5 py-1.5 rounded-lg bg-bg hover:bg-panel-elevated border border-line text-dim hover:text-text text-xs font-medium flex items-center gap-1.5 shadow-sm"
                title="Kembalikan ke posisi awal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRoundMask(!isRoundMask)}
              className={`btn-interactive px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors ${
                isRoundMask
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-bg border-line text-dim hover:text-text'
              }`}
              title="Pratinjau potongan lingkaran vs persegi"
            >
              {isRoundMask ? <Circle className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>{isRoundMask ? 'Mode Lingkaran' : 'Mode Persegi'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-line bg-panel flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-interactive px-4 py-2 rounded-xl bg-bg hover:bg-panel-elevated border border-line text-dim hover:text-text text-xs font-medium transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="btn-interactive px-5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-[#141414] text-xs font-bold shadow-[0_2px_12px_rgba(226,232,0,0.3)] hover:shadow-[0_4px_16px_rgba(226,232,0,0.45)] transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Terapkan &amp; Simpan</span>
          </button>
        </div>
      </div>
    </div>
  )
}
