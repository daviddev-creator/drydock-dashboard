<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { api, formatMoney } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.vue';
import StatusBadge from '../../components/ui/StatusBadge.vue';
import AppModal from '../../components/ui/AppModal.vue';
import DataTable from '../../components/ui/DataTable.vue';
import SearchSelect from '../../components/ui/SearchSelect.vue';

const router = useRouter();

const docks = ref([]);
const vessels = ref([]);
const shipyards = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);

const emptyForm = {
    dock_no: '', description: '', vessel_id: '', shipyard_id: '',
    company: 'Acme Ship Managers Pte Ltd.', account_code: '',
    responsible_rank: '', budget: 0, currency: 'USD',
    planned_start: '', planned_end: '', priority: 'Medium', status: 'Planning',
};
const form = ref({ ...emptyForm });

const columns = [
    { key: 'dock_no', label: 'Dry Dock No' },
    { key: 'description', label: 'Description', detailed: true },
    { key: 'vessel_name', label: 'Vessel' },
    { key: 'status', label: 'Status' },
    { key: 'shipyard_name', label: 'Shipyard', detailed: true },
    { key: 'priority', label: 'Priority', detailed: true },
    { key: 'planned_start', label: 'Planned Start', detailed: true },
    { key: 'planned_end', label: 'Planned End', detailed: true },
    { key: 'budget', label: 'Budget', align: 'right', detailed: true },
];
const filters = [{ key: 'status', label: 'Semua status', options: ['Planning', 'Execution', 'Completed'] }];

const statuses = ['Planning', 'Execution', 'Completed'];

async function load() {
    loading.value = true;
    try {
        docks.value = await api.get('/dry-docks');
        if (vessels.value.length === 0) {
            [vessels.value, shipyards.value] = await Promise.all([api.get('/vessels'), api.get('/shipyards')]);
        }
    } finally {
        loading.value = false;
    }
}

async function save() {
    saving.value = true;
    try {
        await api.post('/dry-docks', form.value);
        showModal.value = false;
        form.value = { ...emptyForm };
        await load();
    } finally {
        saving.value = false;
    }
}

async function remove(dock) {
    if (!confirm(`Hapus dry dock "${dock.dock_no} — ${dock.vessel_name}"?`)) return;
    await api.del(`/dry-docks/${dock.id}`);
    await load();
}

onMounted(load);
</script>

<template>
    <div class="p-6">
        <PageHeader title="Dry Docks" subtitle="Rencana dan pelaksanaan docking per vessel" />

        <section class="mb-8">
            <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">My Dry Docks</h2>
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <RouterLink v-for="dock in docks.slice(0, 4)" :key="dock.id" :to="`/dry-docks/${dock.id}`"
                    class="card p-4 transition-shadow hover:shadow-md">
                    <div class="mb-2 flex items-center justify-between">
                        <span class="text-xs font-medium text-slate-400">Menu</span>
                        <StatusBadge :status="dock.status" />
                    </div>
                    <p class="text-sm text-slate-500">{{ dock.vessel_name }}</p>
                    <p class="mt-1 font-bold text-slate-800">{{ dock.dock_no }}</p>
                    <p class="mt-0.5 truncate text-xs text-slate-500">{{ dock.description }}</p>
                </RouterLink>
            </div>
        </section>

        <section>
            <h2 class="mb-3 text-lg font-semibold text-slate-800">All Dry Docks</h2>
            <DataTable :columns="columns" :rows="docks" :filters="filters" export-name="dry-docks" add-label="Add"
                :loading="loading" clickable @add="showModal = true"
                @row-click="(row) => router.push(`/dry-docks/${row.id}`)">
                <template #cell-status="{ row }">
                    <StatusBadge :status="row.status" />
                </template>
                <template #cell-budget="{ row }">{{ formatMoney(row.budget) }}</template>
                <template #actions="{ row }">
                    <button class="btn-danger !px-2.5 !py-1 text-xs" @click="remove(row)">Delete</button>
                </template>
            </DataTable>
        </section>

        <AppModal :open="showModal" title="Add Dry Dock" :saving="saving" @close="showModal = false" @save="save">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Dry Dock No</label>
                    <input v-model="form.dock_no" class="input" placeholder="SEPT2020/DD1" />
                </div>
                <div>
                    <label class="label">Vessel</label>
                    <SearchSelect v-model="form.vessel_id"
                        :options="vessels.map((v) => ({ value: v.id, label: v.name }))" placeholder="Cari vessel…" />
                </div>
            </div>
            <div>
                <label class="label">Description</label>
                <input v-model="form.description" class="input" placeholder="DD Required to change BWT" />
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Shipyard</label>
                    <SearchSelect v-model="form.shipyard_id"
                        :options="shipyards.map((s) => ({ value: s.id, label: s.name }))"
                        placeholder="Cari shipyard…" />
                </div>
                <div>
                    <label class="label">Priority</label>
                    <select v-model="form.priority" class="input">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Planned Start</label>
                    <input v-model="form.planned_start" type="date" class="input" />
                </div>
                <div>
                    <label class="label">Planned End</label>
                    <input v-model="form.planned_end" type="date" class="input" />
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Budget</label>
                    <input v-model.number="form.budget" type="number" class="input" />
                </div>
                <div>
                    <label class="label">Status</label>
                    <select v-model="form.status" class="input">
                        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                    </select>
                </div>
            </div>
        </AppModal>
    </div>
</template>
