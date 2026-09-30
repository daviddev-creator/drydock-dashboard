<script setup>
import { ref, computed, watch } from 'vue';
import SearchBar from './SearchBar.vue';
import EmptyState from './EmptyState.vue';

const props = defineProps({
    columns: { type: Array, required: true },
    rows: { type: Array, default: () => [] },
    filters: { type: Array, default: () => [] },
    exportName: { type: String, default: 'export' },
    addLabel: { type: String, default: 'Add' },
    loading: { type: Boolean, default: false },
    clickable: { type: Boolean, default: false },
    showActions: { type: Boolean, default: true },
    emptyMessage: { type: String, default: 'Belum ada data.' },
});
const emit = defineEmits(['add', 'row-click']);

const search = ref('');
const viewMode = ref('minimal'); 
const activeFilters = ref({});

watch(
    () => props.filters,
    (fs) => {
        for (const f of fs) if (activeFilters.value[f.key] === undefined) activeFilters.value[f.key] = '';
    },
    { immediate: true, deep: true },
);

const visibleColumns = computed(() =>
    viewMode.value === 'minimal' ? props.columns.filter((c) => !c.detailed) : props.columns,
);

const filteredRows = computed(() => {
    const q = search.value.trim().toLowerCase();
    return props.rows.filter((row) => {
        for (const f of props.filters) {
        const wanted = activeFilters.value[f.key];
        if (wanted && String(row[f.key]) !== wanted) return false;
        }
        if (!q) return true;
        return props.columns.some((c) => String(row[c.key] ?? '').toLowerCase().includes(q));
    });
});

function exportCsv() {
    const escape = (val) => `"${String(val ?? '').replaceAll('"', '""')}"`;
    const header = visibleColumns.value.map((c) => escape(c.label)).join(',');
    const lines = filteredRows.value.map((row) =>
        visibleColumns.value.map((c) => escape(row[c.key])).join(','),
    );
    const blob = new Blob([`\uFEFF${[header, ...lines].join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${props.exportName}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
</script>

<template>
    <div>
        <div class="mb-4 flex flex-wrap items-center gap-2.5">
            <SearchBar v-model="search" />

            <select
                v-for="f in filters"
                :key="f.key"
                v-model="activeFilters[f.key]"
                class="input w-auto"
                :title="`Filter ${f.label}`"
            >
                <option value="">{{ f.label }}</option>
                <option v-for="opt in f.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>

            <div class="ml-auto flex items-center gap-2">
                <div class="flex overflow-hidden rounded-lg border border-slate-300 text-xs font-medium">
                    <button
                        class="px-3 py-2"
                        :class="viewMode === 'minimal' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'"
                        @click="viewMode = 'minimal'"
                    >
                        Minimal
                    </button>
                    <button
                        class="px-3 py-2"
                        :class="viewMode === 'detailed' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'"
                        @click="viewMode = 'detailed'"
                    >
                        Detailed
                    </button>
                </div>
                <button class="btn-secondary" @click="exportCsv">⇩ Export</button>
                <button class="btn-primary" @click="emit('add')">+ {{ addLabel }}</button>
            </div>
        </div>

        <EmptyState v-if="loading" loading />
        <EmptyState v-else-if="filteredRows.length === 0" :message="emptyMessage" />

        <div v-else class="card overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="table-head">
                    <tr>
                        <th
                            v-for="col in visibleColumns"
                            :key="col.key"
                            class="px-4 py-3"
                            :class="col.align === 'right' ? 'text-right' : ''"
                        >
                            {{ col.label }}
                        </th>
                        <th v-if="showActions" class="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr
                        v-for="row in filteredRows"
                        :key="row.id ?? JSON.stringify(row)"
                        class="hover:bg-slate-50"
                        :class="clickable ? 'cursor-pointer' : ''"
                        @click="clickable && emit('row-click', row)"
                    >
                        <td
                            v-for="col in visibleColumns"
                            :key="col.key"
                            class="px-4 py-3"
                            :class="col.align === 'right' ? 'text-right' : ''"
                        >
                            <slot :name="`cell-${col.key}`" :row="row">{{ row[col.key] ?? '—' }}</slot>
                        </td>
                        <td v-if="showActions" class="px-4 py-3 text-right" @click.stop>
                            <slot name="actions" :row="row" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
