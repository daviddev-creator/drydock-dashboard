<script setup>
defineProps({
    message: { type: String, default: 'Data not yet.' },
    loading: { type: Boolean, default: false },
});
</script>

<template>
    <div class="card flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
        <span v-if="loading" class="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" />
        <p class="text-sm text-slate-500">{{ loading ? 'Loading data…' : message }}</p>
    </div>
</template>
