<script setup>
defineProps({
    open: { type: Boolean, required: true },
    title: { type: String, required: true },
    saving: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'save']);
</script>

<template>
    <Teleport to="body">
        <div
            v-if="open"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
            @click.self="emit('close')"
        >
            <div class="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div class="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
                    <h3 class="text-base font-semibold text-slate-800">{{ title }}</h3>
                    <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">✕</button>
                </div>
                <div class="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4">
                    <slot />
                </div>
                <div class="flex justify-end gap-2 border-t border-slate-200 px-5 py-3.5">
                    <button class="btn-secondary" @click="emit('close')">Batal</button>
                    <button class="btn-primary" :disabled="saving" @click="emit('save')">
                        {{ saving ? 'Menyimpan…' : 'Simpan' }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>
