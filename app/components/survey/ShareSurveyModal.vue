<template>
  <UModal v-model:open="isOpen" :title="`Bagikan Survei - ${survey?.title || ''}`">
    <template #content>
      <div class="flex flex-col max-h-[85vh] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl">
        <!-- Scrollable Body Content -->
        <div class="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin">
          <!-- Header Info -->
          <div class="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-3 gap-2">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <UIcon name="i-heroicons-share" class="w-5 h-5 mr-2 text-primary-500 shrink-0" />
                Bagikan Survei &amp; QR Code
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Sebarkan link survei atau unduh poster foto QR Code untuk dicetak.
              </p>
            </div>
            <UBadge
              :color="survey?.is_active ? 'success' : 'neutral'"
              variant="soft"
              class="shrink-0"
            >
              {{ survey?.is_active ? 'Publik' : 'Draft' }}
            </UBadge>
          </div>

          <!-- Copy Link Section -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Tautan Publik Survei
            </label>
            <div class="flex items-center space-x-2">
              <UInput
                :model-value="surveyUrl"
                readonly
                size="sm"
                class="flex-1 font-mono text-xs"
              />
              <UButton
                color="primary"
                size="sm"
                :icon="isCopied ? 'i-heroicons-check' : 'i-heroicons-clipboard-document'"
                @click="copyLink"
              >
                {{ isCopied ? 'Tersalin!' : 'Salin Link' }}
              </UButton>
            </div>
          </div>

          <!-- QR Card Aesthetic Preview -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Pratinjau Foto QR Card (Format Unduhan PNG)
              </label>
              <span class="text-2xs text-gray-400">Desain Poster Siap Cetak</span>
            </div>

            <!-- Hidden Canvas for high-res 1000x1300 PNG export -->
            <canvas ref="exportCanvas" class="hidden" width="1000" height="1300"></canvas>

            <!-- On-screen responsive preview card -->
            <div
              ref="previewCardRef"
              class="relative overflow-hidden rounded-xl p-5 sm:p-6 bg-linear-to-br from-slate-900 via-indigo-950 to-gray-900 text-white shadow-lg border border-indigo-500/30 text-center space-y-4 select-none"
            >
              <!-- Background Decorative Orbs -->
              <div class="absolute -top-10 -left-10 w-28 h-28 bg-primary-500/20 rounded-full blur-2xl pointer-events-none"></div>
              <div class="absolute -bottom-10 -right-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

              <!-- Brand Header -->
              <div class="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-bold tracking-widest text-primary-300">
                <span><span class="font-bold">📑 Formly</span> | Interactive Survey</span>
              </div>

              <!-- Survey Title & Description -->
              <div class="space-y-1 max-w-sm mx-auto">
                <h2 class="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight line-clamp-2">
                  {{ survey?.title || 'Judul Survei' }}
                </h2>
                <p v-if="survey?.description" class="text-2xs text-gray-300 line-clamp-2">
                  {{ survey.description }}
                </p>
              </div>

              <!-- QR Container -->
              <div class="inline-block p-3 bg-white rounded-xl shadow-xl border-2 border-white/20">
                <canvas ref="qrCanvasRef" class="w-40 h-40 sm:w-48 sm:h-48 mx-auto block"></canvas>
              </div>

              <!-- Scan Prompt & URL -->
              <div class="space-y-0.5 pt-0.5">
                <p class="text-xs font-semibold text-indigo-200 flex items-center justify-center">
                  <UIcon name="i-heroicons-qr-code" class="w-3.5 h-3.5 mr-1 text-primary-400" />
                  Pindai QR Code di atas untuk mengisi survei
                </p>
                <p class="text-[10px] font-mono text-gray-400 truncate max-w-xs mx-auto">
                  {{ surveyUrl }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Fixed / Sticky Footer Actions -->
        <div class="flex items-center justify-between p-4 sm:px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 shrink-0">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            @click="isOpen = false"
          >
            Tutup
          </UButton>

          <UButton
            color="primary"
            variant="solid"
            size="sm"
            icon="i-heroicons-arrow-down-tray"
            :loading="isDownloading"
            @click="downloadQRCard"
          >
            Unduh Foto QR Card (PNG)
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import QRCode from 'qrcode'
import { useDemoMode } from '~/composables/useDemoMode'

export interface ShareSurveyModalProps {
  open: boolean
  survey: {
    id: string
    title: string
    description?: string | null
    is_active?: boolean
  } | null
}

const props = defineProps<ShareSurveyModalProps>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
}>()

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
})

const { isDemo } = useDemoMode()

const qrCanvasRef = ref<HTMLCanvasElement | null>(null)
const exportCanvas = ref<HTMLCanvasElement | null>(null)

const isCopied = ref(false)
const isDownloading = ref(false)
const toast = useToast?.()

const surveyUrl = computed(() => {
  if (!props.survey?.id) return ''
  const isDemoTarget = isDemo.value || props.survey.id.startsWith('demo-')
  const query = isDemoTarget ? '?demo=true' : ''
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/survey/${props.survey.id}${query}`
  }
  return `/survey/${props.survey.id}${query}`
})

// Generate QR Code on screen canvas
watch(
  [() => props.open, () => props.survey?.id],
  async ([open, surveyId]) => {
    if (open && surveyId) {
      await nextTick()
      renderQRCanvas()
    }
  },
  { immediate: true }
)

function renderQRCanvas() {
  if (!qrCanvasRef.value || !surveyUrl.value) return
  QRCode.toCanvas(
    qrCanvasRef.value,
    surveyUrl.value,
    {
      width: 200,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    },
    (err) => {
      if (err) console.error('Failed to render QR Code:', err)
    }
  )
}

async function copyLink() {
  if (!surveyUrl.value) return
  try {
    await navigator.clipboard.writeText(surveyUrl.value)
    isCopied.value = true
    if (toast) {
      toast.add({
        title: 'Tautan Tersalin!',
        description: 'URL survei publik berhasil disalin ke clipboard.',
        color: 'success',
      })
    }
    setTimeout(() => {
      isCopied.value = false
    }, 3000)
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

/**
 * Draw attractive high-resolution Graphic Card onto Export Canvas & download as PNG
 */
async function downloadQRCard() {
  if (!props.survey || !surveyUrl.value || !exportCanvas.value) return
  isDownloading.value = true

  try {
    const canvas = exportCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = 1000
    const height = 1300
    canvas.width = width
    canvas.height = height

    // 1. Draw Gradient Background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height)
    bgGradient.addColorStop(0, '#0f172a')   // Slate 900
    bgGradient.addColorStop(0.5, '#1e1b4b') // Indigo 950
    bgGradient.addColorStop(1, '#020617')   // Slate 950
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // 2. Draw Decorative Glow Circles
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)' // Indigo glow
    ctx.beginPath()
    ctx.arc(100, 100, 250, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)' // Emerald glow
    ctx.beginPath()
    ctx.arc(width - 100, height - 100, 300, 0, Math.PI * 2)
    ctx.fill()

    // 3. Draw Outer Card Border Container
    ctx.strokeStyle = 'rgba(129, 140, 248, 0.3)'
    ctx.lineWidth = 4
    drawRoundedRect(ctx, 50, 50, width - 100, height - 100, 36)
    ctx.stroke()

    // 4. Draw Brand Header Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    drawRoundedRect(ctx, width / 2 - 180, 100, 360, 48, 24)
    ctx.fill()

    ctx.fillStyle = '#a5b4fc' // Indigo 300
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('📑 Formly | Interactive Survey', width / 2, 131)

    // 5. Draw Survey Title (Wrapped text)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 44px sans-serif'
    ctx.textAlign = 'center'
    
    const titleText = props.survey?.title || 'Judul Survei'
    const titleLines = getWrappedLines(ctx, titleText, width - 180)
    let startY = 220
    for (const line of titleLines.slice(0, 2)) {
      ctx.fillText(line, width / 2, startY)
      startY += 54
    }

    // 6. Draw Survey Description if present
    if (props.survey?.description) {
      ctx.fillStyle = '#94a3b8' // Slate 400
      ctx.font = '22px sans-serif'
      const descLines = getWrappedLines(ctx, props.survey?.description || '', width - 240)
      for (const line of descLines.slice(0, 2)) {
        ctx.fillText(line, width / 2, startY + 10)
        startY += 32
      }
    }

    // 7. Render High-Res QR Code Data URL
    const qrDataUrl = await QRCode.toDataURL(surveyUrl.value, {
      width: 480,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })

    const qrImg = new Image()
    qrImg.src = qrDataUrl
    await new Promise((res) => { qrImg.onload = res })

    // Draw QR White Card Background Container with Rounded Corners & Shadow
    const qrCardSize = 520
    const qrCardX = (width - qrCardSize) / 2
    const qrCardY = 460

    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 12
    ctx.fillStyle = '#ffffff'
    drawRoundedRect(ctx, qrCardX, qrCardY, qrCardSize, qrCardSize, 32)
    ctx.fill()
    ctx.restore()

    // Draw QR Image inside card
    ctx.drawImage(qrImg, qrCardX + 20, qrCardY + 20, qrCardSize - 40, qrCardSize - 40)

    // 8. Draw Footer Info & URL
    ctx.fillStyle = '#818cf8' // Indigo 400
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('📱 Pindai QR Code di atas untuk mengisi survei', width / 2, qrCardY + qrCardSize + 70)

    ctx.fillStyle = '#64748b' // Slate 500
    ctx.font = '20px monospace'
    ctx.fillText(surveyUrl.value, width / 2, qrCardY + qrCardSize + 115)

    // 9. Export Canvas to PNG Blob & Trigger Download
    const dataUrl = canvas.toDataURL('image/png')
    const sanitizedTitle = (props.survey?.title || 'survey').toLowerCase().replace(/[^a-z0-9]/g, '_')
    
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `formly_qr_${sanitizedTitle}.png`
    link.click()

    if (toast) {
      toast.add({
        title: 'QR Card Berhasil Diunduh!',
        description: 'File foto QR Card dengan tampilan menarik tersimpan.',
        color: 'success',
      })
    }
  } catch (err) {
    console.error('Failed to export QR card:', err)
  } finally {
    isDownloading.value = false
  }
}

// Helper to draw rounded rectangle on Canvas 2D Context
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Helper to wrap text into multiple lines on Canvas 2D Context
function getWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = words[0] || ''

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(currentLine + ' ' + word).width
    if (width < maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}
</script>
