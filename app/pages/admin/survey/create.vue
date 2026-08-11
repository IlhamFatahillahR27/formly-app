<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <!-- Header with Back Navigation -->
    <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
      <div>
        <NuxtLink to="/admin/dashboard" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 transition-colors">
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-1" />
          Kembali ke Dashboard
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Buat Survei Baru
        </h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Isi informasi dasar survei untuk mulai menyusun pertanyaan dan alur logika.
        </p>
      </div>
    </div>

    <!-- Error Alert -->
    <UAlert
      v-if="errorMessage"
      color="error"
      variant="subtle"
      title="Gagal Membuat Survei"
      :description="errorMessage"
      icon="i-heroicons-exclamation-triangle"
      class="mb-4 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 shadow-sm"
    />

    <!-- Form Container Card -->
    <UCard class="shadow-md border border-gray-200 dark:border-gray-800">
      <form @submit.prevent="handleCreateSurvey" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Judul Survei <span class="text-red-500">*</span>
          </label>
          <UInput
            v-model="title"
            placeholder="Contoh: Survei Kepuasan Pelanggan 2026"
            icon="i-heroicons-document-text"
            required
            class="w-full"
            :disabled="isLoading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Deskripsi Survei (Opsional)
          </label>
          <UTextarea
            v-model="description"
            placeholder="Berikan penjelasan singkat atau petunjuk bagi pengisi survei..."
            :rows="4"
            class="w-full"
            :disabled="isLoading"
          />
        </div>

        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <NuxtLink to="/admin/dashboard">
            <UButton color="neutral" variant="ghost" :disabled="isLoading">
              Batal
            </UButton>
          </NuxtLink>
          <UButton
            type="submit"
            color="primary"
            icon="i-heroicons-sparkles"
            :loading="isLoading"
          >
            Buat Survei &amp; Lanjut
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { createSurvey } = useSurveys()
const router = useRouter()
const toast = useToast?.()

const title = ref('')
const description = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

async function handleCreateSurvey() {
  errorMessage.value = ''

  if (!title.value.trim()) {
    errorMessage.value = 'Judul survei tidak boleh kosong.'
    return
  }

  isLoading.value = true

  try {
    const { survey, error } = await createSurvey({
      title: title.value,
      description: description.value,
    })

    if (error || !survey) {
      errorMessage.value = error || 'Gagal menyimpan survei ke database.'
      if (toast) {
        toast.add({
          title: 'Gagal Membuat Survei',
          description: errorMessage.value,
          color: 'error',
        })
      }
    } else {
      if (toast) {
        toast.add({
          title: 'Survei Berhasil Dibuat',
          description: `Survei "${survey.title}" telah dibuat dengan Section 1 pertama.`,
          color: 'success',
        })
      }
      await router.push(`/admin/survey/${survey.id}/edit`)
    }
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.'
  } finally {
    isLoading.value = false
  }
}
</script>
