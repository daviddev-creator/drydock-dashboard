<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { api } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader.vue";
import DataTable from "../../components/ui/DataTable.vue";
import SearchSelect from "../../components/ui/SearchSelect.vue";
import AppModal from "../../components/ui/AppModal.vue";

const groups = ref([]);
const vessels = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);

const emptyForm = {
    name: "",
    group_no: "",
    vessel_id: "",
    sort_order: 0,
    frontpage: false,
};
const form = ref({ ...emptyForm });
const editingId = ref(null);

const columns = [
    { key: "name", label: "Name" },
    { key: "vessel_name", label: "Vessel" },
    { key: "group_no", label: "Group No" },
    { key: "sort_order", label: "Sort Order", detailed: true },
    { key: "frontpage", label: "Frontpage", detailed: true },
];
const filters = [
    {
        key: "vessel_name",
        label: "Semua vessel",
        options: [],
    },
];

async function load() {
    loading.value = true;
    try {
        groups.value = await api.get("/specification-groups");
        if (vessels.value.length === 0) vessels.value = await api.get("/vessels");
            filters[0].options = [
            ...new Set(groups.value.map((g) => g.vessel_name).filter(Boolean)),
        ];
    } finally {
        loading.value = false;
    }
}

function openCreate() {
    editingId.value = null;
    form.value = { ...emptyForm };
    showModal.value = true;
}

function openEdit(group) {
    editingId.value = group.id;
    form.value = { ...group, vessel_id: group.vessel_id ?? "" };
    showModal.value = true;
}

async function save() {
    saving.value = true;
    try {
        if (editingId.value)
            await api.put(`/specification-groups/${editingId.value}`, form.value);
        else await api.post("/specification-groups", form.value);
            showModal.value = false;
        await load();
    } finally {
        saving.value = false;
    }
}

async function remove(group) {
    if (!confirm(`Hapus group "${group.name}"?`)) return;
    await api.del(`/specification-groups/${group.id}`);
    await load();
}

onMounted(load);
</script>

<template>
    <div class="p-6">
        <PageHeader title="Specification Groups" subtitle="Kelompok spesifikasi per vessel" />

        <DataTable :columns="columns" :rows="groups" :filters="filters" export-name="specification-groups"
            add-label="Add" :loading="loading" empty-message="Belum ada specification group." @add="openCreate">
            <template #cell-name="{ row }">
                <RouterLink :to="`/specification-groups/${row.id}`"
                    class="font-medium text-primary-700 hover:underline">
                    {{ row.name }}
                </RouterLink>
            </template>
            <template #cell-frontpage="{ row }">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="row.frontpage
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    ">
                    {{ row.frontpage ? "Yes" : "No" }}
                </span>
            </template>
            <template #actions="{ row }">
                <button class="btn-secondary !px-2.5 !py-1 text-xs" @click="openEdit(row)">
                    Edit
                </button>
                <button class="btn-danger ml-1.5 !px-2.5 !py-1 text-xs" @click="remove(row)">
                    Delete
                </button>
            </template>
        </DataTable>

        <AppModal :open="showModal" :title="editingId ? 'Edit Specification Group' : 'Add Specification Group'
            " :saving="saving" @close="showModal = false" @save="save">
            <div>
                <label class="label">Name</label>
                <input v-model="form.name" class="input" placeholder="Mis. Hull" />
            </div>
            <div>
                <label class="label">Group No</label>
                <input v-model="form.group_no" class="input" placeholder="Mis. B1" />
            </div>
            <div>
                <label class="label">Vessel</label>
                <SearchSelect v-model="form.vessel_id" :options="vessels.map((v) => ({ value: v.id, label: v.name }))"
                    placeholder="Cari vessel…" />
            </div>
            <div>
                <label class="label">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" class="input" />
            </div>
            <label class="flex items-center gap-2 text-sm text-slate-700">
                <input v-model="form.frontpage" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
                Frontpage
            </label>
        </AppModal>
    </div>
</template>
