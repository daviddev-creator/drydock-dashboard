<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Search' },
});
const emit = defineEmits(['update:modelValue']);

const local = ref(props.modelValue);
let timer = null;

watch(local, (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => emit('update:modelValue', value), 300);
});
</script>

<template>
    <div class="relative w-full sm:max-w-xs">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input v-model="local" type="search" :placeholder="placeholder" class="input pl-9" />
    </div>
</template>
