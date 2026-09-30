<script setup>
defineProps({
    label: { type: String, required: true },
    value: { type: [String, Number, Boolean], default: '' },
});
</script>

<template>
    <div>
        <p class="label">{{ label }}</p>
        <p class="text-sm text-slate-800">{{ value === '' || value === null || value === undefined ? '—' : value }}</p>
    </div>
</template>
