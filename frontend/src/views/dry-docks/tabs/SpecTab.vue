<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../../../services/api';
import StatusBadge from '../../../components/ui/StatusBadge.vue';
import AppModal from '../../../components/ui/AppModal.vue';
import SearchSelect from '../../../components/ui/SearchSelect.vue';
import EmptyState from '../../../components/ui/EmptyState.vue';

const props = defineProps({ dockId: { type: String, required: true } });

const emit = defineEmits(['refresh']);

const items = ref([]);
const workOrders = ref([]);
const loading = ref(true);
const showAdd = ref(false);
const addForm = ref({ work_order_id: '', location: '' });

const grouped = computed(() => {
    const map = new Map();
    for (const row of items.value) {
        const key = row.spec_group_name ?? 'Tanpa Group';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(row);
    }
    return [...map.entries()].map(([name, list]) => ({ name, list }));
});

async function load() {
    loading.value = true;
    try {
        items.value = await api.get(`/dry-docks/${props.dockId}/work-orders`);
        if (workOrders.value.length === 0) workOrders.value = await api.get('/work-orders');
    } finally {
        loading.value = false;
    }
}

async function add() {
    await api.post(`/dry-docks/${props.dockId}/work-orders`, addForm.value);
    showAdd.value = false;
    addForm.value = { work_order_id: '', location: '' };
    await load();
    emit('refresh');
}

async function setStatus(row, status) {
    await api.put(`/dry-docks/${props.dockId}/work-orders/${row.dock_wo_id}`, { status });
    await load();
    emit('refresh');
}

async function toggleExported(row) {
    await api.put(`/dry-docks/${props.dockId}/work-orders/${row.dock_wo_id}`, { exported: !row.exported });
    await load();
}

async function remove(row) {
    if (!confirm('Keluarkan work order ini dari spesifikasi dock?')) return;
    await api.del(`/dry-docks/${props.dockId}/work-orders/${row.dock_wo_id}`);
    await load();
    emit('refresh');
}

onMounted(load);
</script>

<template>
    <div class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
                :class="items.some((i) => i.exported) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">
                {{items.some((i) => i.exported) ? 'EXPORTED' : 'NOT EXPORTED'}}
            </span>
            <button class="btn-primary" @click="showAdd = true">+ Add Work Order</button>
        </div>

        <EmptyState v-if="loading" loading />
        <EmptyState v-else-if="items.length === 0" message="Belum ada work order pada spesifikasi dock ini." />

        <section v-for="group in grouped" :key="group.name">
            <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{{ group.name }}</h3>
            <div class="card divide-y divide-slate-100">
                <div v-for="row in group.list" :key="row.dock_wo_id"
                    class="flex flex-wrap items-center gap-3 px-4 py-3">
                    <StatusBadge :status="row.status" />
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-slate-800">{{ row.job_name }}</p>
                        <p class="truncate text-xs text-slate-500">{{ row.location || '—' }}</p>
                    </div>
                    <select class="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                        :value="row.status" @change="setStatus(row, $event.target.value)">
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>On Hold</option>
                        <option>Complete</option>
                    </select>
                    <button class="btn-secondary !px-2.5 !py-1 text-xs" @click="toggleExported(row)">
                        {{ row.exported ? '⇡ Un-export' : '⇣ Export' }}
                    </button>
                    <button class="btn-danger !px-2.5 !py-1 text-xs" @click="remove(row)">Remove</button>
                </div>
            </div>
        </section>

        <AppModal :open="showAdd" title="Add Work Order ke Spesifikasi" @close="showAdd = false" @save="add">
            <div>
                <label class="label">Work Order (dari Work Order Master)</label>
                <SearchSelect v-model="addForm.work_order_id"
                    :options="workOrders.map((wo) => ({ value: wo.id, label: `${wo.job_code} — ${wo.job_name}` }))"
                    placeholder="Cari work order…" />
            </div>
            <div>
                <label class="label">Location / Komponen</label>
                <input v-model="addForm.location" class="input" />
            </div>
        </AppModal>
    </div>
</template>
