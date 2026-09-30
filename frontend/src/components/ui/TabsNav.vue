<script setup>
defineProps({
    tabs: { type: Array, required: true }, // [{ key, label }]
    modelValue: { type: String, required: true },
});
defineEmits(['update:modelValue']);
</script>

<template>
    <div class="mb-5 flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        <button v-for="tab in tabs" :key="tab.key"
            class="rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors"
            :class="modelValue === tab.key ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-200'"
            @click="$emit('update:modelValue', tab.key)">
            {{ tab.label }}
        </button>
    </div>
</template>
