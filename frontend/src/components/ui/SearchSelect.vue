<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    modelValue: { type: [String, Number], default: '' },
    options: { type: Array, default: () => [] }, // [{ value, label }]
    placeholder: { type: String, default: 'Pilih…' },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
});
const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const query = ref('');

const selected = computed(() => props.options.find((o) => String(o.value) === String(props.modelValue)));
const display = computed(() => (open.value ? query.value : selected.value?.label ?? ''));

const filtered = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return props.options;
    return props.options.filter((o) => String(o.label).toLowerCase().includes(q));
});

function openDropdown() {
    if (props.disabled) return;
    open.value = true;
    query.value = '';
}

function choose(option) {
    emit('update:modelValue', option.value);
    open.value = false;
}

function clear() {
    emit('update:modelValue', '');
    open.value = false;
}

function onClickOutside(event) {
    if (root.value && !root.value.contains(event.target)) open.value = false;
}
const root = ref(null);
onMounted(() => document.addEventListener('mousedown', onClickOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside));
</script>

<template>
    <div ref="root" class="relative">
        <div class="relative">
            <input
                :value="display"
                :placeholder="placeholder"
                :disabled="disabled"
                class="input pr-14"
                @focus="openDropdown"
                @input="open = true; query = $event.target.value"
                @keydown.escape="open = false"
            />
            <button
                v-if="clearable && !open && selected"
                type="button"
                class="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-red-500"
                title="Hapus pilihan"
                @click.stop="clear"
            >
                ✕
            </button>
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ▾
            </span>
        </div>

        <ul
            v-if="open"
            class="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
            <li v-if="filtered.length === 0" class="px-3 py-2 text-sm text-slate-400">
                Tidak ada opsi
            </li>
            <li v-for="option in filtered" :key="option.value">
                <button
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm hover:bg-primary-50"
                    :class="String(option.value) === String(modelValue) ? 'bg-primary-50 font-medium text-primary-700' : 'text-slate-700'"
                    @mousedown.prevent="choose(option)"
                >
                    {{ option.label }}
                </button>
            </li>
        </ul>
    </div>
</template>
