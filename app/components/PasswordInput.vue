<script setup lang="ts">
const props = defineProps<{
    disabled?: boolean
    required?: boolean
}>()

const password = defineModel<string>({ default: '' })

const showPassword = ref(false)
</script>

<template>
    <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
        </label>

        <UInput v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
            icon="i-heroicons-lock-closed" :required="required" class="w-full" :disabled="disabled">
            <template #trailing>
                <UButton color="neutral" variant="ghost"
                    :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" :disabled="disabled"
                    @click="showPassword = !showPassword" />
            </template>
        </UInput>
    </div>
</template>