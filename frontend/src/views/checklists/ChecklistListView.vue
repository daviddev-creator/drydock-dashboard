<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.vue';
import DataTable from '../../components/ui/DataTable.vue';
import AppModal from '../../components/ui/AppModal.vue';

const checklists = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);
const form = ref({ name: '', description: '', active: true });

const columns = [
    { key: 'name', label: 'Checklist Name' },
    { key: 'description', label: 'Description', detailed: true },
    { key: 'active', label: 'Active' },
];
const filters = [{ key: 'active_label', label: 'Semua status', options: ['Yes', 'No'] }];

async function load() {
    loading.value = true;
    try {
        const rows = await api.get('/checklists');
        checklists.value = rows.map((c) => ({ ...c, active_label: c.active ? 'Yes' : 'No' }));
    } finally {
        loading.value = false;
    }
}

async function save() {
    saving.value = true;
    try {
        await api.post('/checklists', form.value);
        showModal.value = false;
        form.value = { name: '', description: '', active: true };
        await load();
    } finally {
        saving.value = false;
    }
}

onMounted(load);
</script>

<template>
    <div class="p-6">
        <PageHeader title="Checklists" subtitle="Template checklist untuk work order" />

        <DataTable :columns="columns" :rows="checklists" :filters="filters" export-name="checklists" add-label="Add"
            :loading="loading" empty-message="Belum ada checklist." @add="showModal = true">
            <template #cell-name="{ row }">
                <RouterLink :to="`/checklists/${row.id}`" class="font-medium text-primary-700 hover:underline">
                    {{ row.name }}
                </RouterLink>
            </template>
            <template #cell-active="{ row }">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="row.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">
                    {{ row.active ? 'Yes' : 'No' }}
                </span>
            </template>
        </DataTable>

        <AppModal :open="showModal" title="Add Checklist" :saving="saving" @close="showModal = false" @save="save">
            <div>
                <label class="label">Checklist Name</label>
                <input v-model="form.name" class="input" />
            </div>
            <div>
                <label class="label">Description</label>
                <textarea v-model="form.description" rows="2" class="input" />
            </div>
            <label class="flex items-center gap-2 text-sm text-slate-700">
                <input v-model="form.active" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                Active — hanya checklist aktif yang tersedia di work order
            </label>
        </AppModal>
    </div>
</template>