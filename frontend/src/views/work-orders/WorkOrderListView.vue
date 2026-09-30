<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { api, formatMoney } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.vue';
import StatusBadge from '../../components/ui/StatusBadge.vue';
import DataTable from '../../components/ui/DataTable.vue';
import SearchSelect from '../../components/ui/SearchSelect.vue';
import AppModal from '../../components/ui/AppModal.vue';

const workOrders = ref([]);
const vessels = ref([]);
const specGroups = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);

const emptyForm = {
    job_code: '', job_name: '', job_type: 'PMS Job', job_category: '',
    critical_job: false, internal_job: false, estimated_hours: 0,
    responsible_rank: '', budget: 0, internal_estimate: 0,
    vessel_id: '', spec_group_id: '', description: '',
};
const form = ref({ ...emptyForm });

const columns = [
    { key: 'job_type', label: 'Type' },
    { key: 'job_name', label: 'Job Name' },
    { key: 'job_code', label: 'Code' },
    { key: 'spec_group_name', label: 'Spec Group' },
    { key: 'vessel_name', label: 'Vessel', detailed: true },
    { key: 'job_category', label: 'Category', detailed: true },
    { key: 'estimated_hours', label: 'Hours', align: 'right', detailed: true },
    { key: 'budget', label: 'Budget', align: 'right', detailed: true },
];
const filters = [
    { key: 'spec_group_name', label: 'Semua group', options: [] },
    { key: 'job_type', label: 'Semua type', options: ['PMS Job', 'Dock Job', 'UPM Job'] },
];

async function load() {
    loading.value = true;
    try {
        workOrders.value = await api.get('/work-orders');
        if (specGroups.value.length === 0) {
        [vessels.value, specGroups.value] = await Promise.all([api.get('/vessels'), api.get('/specification-groups')]);
        }
        filters[0].options = [...new Set(workOrders.value.map((w) => w.spec_group_name).filter(Boolean))];
    } finally {
        loading.value = false;
    }
}

async function save() {
    saving.value = true;
    try {
        await api.post('/work-orders', form.value);
        showModal.value = false;
        form.value = { ...emptyForm };
        await load();
    } finally {
        saving.value = false;
    }
}

onMounted(load);
</script>

<template>
    <div class="p-6">
        <PageHeader title="Work Order Master" subtitle="Semua work order dari berbagai specification group">
        </PageHeader>

        <DataTable :columns="columns" :rows="workOrders" :filters="filters" export-name="work-orders" add-label="Add"
            :loading="loading" empty-message="Belum ada work order." @add="showModal = true">
            <template #cell-job_type="{ row }">
                <StatusBadge :status="row.job_type" />
            </template>
            <template #cell-job_name="{ row }">
                <RouterLink :to="`/work-orders/${row.id}`" class="font-medium text-primary-700 hover:underline">
                    {{ row.job_name }}
                </RouterLink>
            </template>
            <template #cell-budget="{ row }">{{ formatMoney(row.budget) }}</template>
        </DataTable>

        <AppModal :open="showModal" title="Add Work Order" :saving="saving" @close="showModal = false" @save="save">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Job Code</label>
                    <input v-model="form.job_code" class="input" placeholder="C001" />
                </div>
                <div>
                    <label class="label">Job Type</label>
                    <select v-model="form.job_type" class="input form-select pr-3">
                        <option>PMS Job</option>
                        <option>Dock Job</option>
                        <option>UPM Job</option>
                    </select>
                </div>
            </div>
            <div>
                <label class="label">Job Name</label>
                <input v-model="form.job_name" class="input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Specification Group</label>
                    <SearchSelect v-model="form.spec_group_id"
                        :options="specGroups.map((g) => ({ value: g.id, label: `${g.name} (${g.group_no})` }))"
                        placeholder="Cari group…" />
                </div>
                <div>
                    <label class="label">Vessel</label>
                    <SearchSelect v-model="form.vessel_id"
                        :options="vessels.map((v) => ({ value: v.id, label: v.name }))" placeholder="Cari vessel…" />
                </div>
            </div>
            <div class="grid grid-cols-3 gap-3">
                <div>
                    <label class="label">Estimated Hours</label>
                    <input v-model.number="form.estimated_hours" type="number" class="input" />
                </div>
                <div>
                    <label class="label">Budget</label>
                    <input v-model.number="form.budget" type="number" class="input" />
                </div>
                <div>
                    <label class="label">Internal Estimate</label>
                    <input v-model.number="form.internal_estimate" type="number" class="input" />
                </div>
            </div>
            <div>
                <label class="label">Responsible Rank</label>
                <input v-model="form.responsible_rank" class="input" placeholder="Chief Officer" />
            </div>
        </AppModal>
    </div>
</template>
