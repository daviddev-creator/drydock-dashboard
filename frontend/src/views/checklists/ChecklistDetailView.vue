<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.vue';
import AppModal from '../../components/ui/AppModal.vue';
import EmptyState from '../../components/ui/EmptyState.vue';

const route = useRoute();
const router = useRouter();

const checklist = ref(null);
const loading = ref(true);
const savingHeader = ref(false);

const DATA_TYPES = [
    { value: 'single_choice', label: 'Single Choice (Status)' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'number', label: 'Number field' },
    { value: 'text', label: 'Text field' },
    { value: 'meter_reading', label: 'Meter Reading' },
    { value: 'inspection', label: 'Inspection Check' },
];

const typeLabel = (value) => DATA_TYPES.find((t) => t.value === value)?.label ?? value;

async function load() {
    loading.value = true;
    try {
        checklist.value = await api.get(`/checklists/${route.params.id}`);
    } finally {
        loading.value = false;
    }
}

async function saveHeader() {
    savingHeader.value = true;
    try {
        await api.put(`/checklists/${checklist.value.id}`, {
            name: checklist.value.name,
            description: checklist.value.description,
            active: checklist.value.active,
        });
        alert('Checklist tersimpan.');
    } finally {
        savingHeader.value = false;
    }
}

/* ---- Item modal ---- */
const showItemModal = ref(false);
const savingItem = ref(false);
const editingItem = ref(null);
const emptyItem = { title: '', data_type: 'text', options: '' };
const itemForm = ref({ ...emptyItem });

function openCreateItem() {
    editingItem.value = null;
    itemForm.value = { ...emptyItem };
    showItemModal.value = true;
}

function openEditItem(item) {
    editingItem.value = item.id;
    itemForm.value = {
        title: item.title,
        data_type: item.data_type,
        options: (item.options ?? []).join(', '),
    };
    showItemModal.value = true;
}

async function saveItem() {
    savingItem.value = true;
    try {
        const options = ['single_choice', 'multiple_choice'].includes(itemForm.value.data_type)
        ? itemForm.value.options.split(',').map((o) => o.trim()).filter(Boolean)
        : [];
        const payload = { ...itemForm.value, options };
        if (editingItem.value) await api.put(`/checklists/${checklist.value.id}/items/${editingItem.value}`, payload);
        else await api.post(`/checklists/${checklist.value.id}/items`, payload);
        showItemModal.value = false;
        await load();
    } finally {
        savingItem.value = false;
    }
}

async function deleteItem(item) {
    if (!confirm(`Hapus item "${item.title}"?`)) return;
    await api.del(`/checklists/${checklist.value.id}/items/${item.id}`);
    await load();
}

onMounted(load);
</script>

<template>
    <div class="p-6">
        <button class="btn-secondary mb-4" @click="router.back()">← Back</button>
        <EmptyState v-if="loading" loading />

        <template v-else-if="checklist">
            <PageHeader :title="checklist.name" :subtitle="checklist.description" />

            <div class="grid gap-6 lg:grid-cols-3">
                <div class="card max-w-xl space-y-3 p-5">
                    <div>
                        <label class="label">Checklist Name</label>
                        <input v-model="checklist.name" class="input" />
                    </div>
                    <div>
                        <label class="label">Description</label>
                        <textarea v-model="checklist.description" rows="2" class="input" />
                    </div>
                    <label class="flex items-start gap-2 text-sm text-slate-700">
                        <input v-model="checklist.active" type="checkbox"
                            class="mt-0.5 h-4 w-4 rounded border-slate-300" />
                        <span>
                            <span class="font-semibold uppercase">Active</span><br />
                            <span class="text-xs text-slate-500">Only Active Checklists will be available in work
                                orders</span>
                        </span>
                    </label>
                    <button class="btn-primary" :disabled="savingHeader" @click="saveHeader">Update</button>
                </div>

                <div class="card overflow-hidden lg:col-span-2">
                    <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                        <h3 class="font-semibold text-slate-800">Checklist Items</h3>
                        <button class="btn-secondary !py-1 text-xs" @click="openCreateItem">+ Add</button>
                    </div>
                    <EmptyState v-if="checklist.items.length === 0" message="Belum ada item." />
                    <ul v-else class="divide-y divide-slate-100">
                        <li v-for="item in checklist.items" :key="item.id" class="flex items-center gap-3 px-5 py-3">
                            <div class="flex-1">
                                <p class="text-sm font-medium text-slate-800">{{ item.title }}</p>
                                <p class="text-xs text-slate-500">
                                    {{ typeLabel(item.data_type) }}
                                    <template v-if="item.options?.length"> · {{ item.options.join(', ') }}</template>
                                </p>
                            </div>
                            <button class="btn-secondary !px-2.5 !py-1 text-xs"
                                @click="openEditItem(item)">Edit</button>
                            <button class="btn-danger !px-2.5 !py-1 text-xs" @click="deleteItem(item)">Delete</button>
                        </li>
                    </ul>
                </div>
            </div>
        </template>

        <AppModal :open="showItemModal" :title="editingItem ? 'Edit Checklist Item' : 'Add Checklist Item'"
            :saving="savingItem" @close="showItemModal = false" @save="saveItem">
            <div>
                <label class="label">Title</label>
                <input v-model="itemForm.title" class="input" placeholder="Mis. Were the locks inspected" />
            </div>
            <div>
                <label class="label">Data Type</label>
                <select v-model="itemForm.data_type" class="input">
                    <option v-for="t in DATA_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
            </div>
            <div v-if="['single_choice', 'multiple_choice'].includes(itemForm.data_type)">
                <label class="label">Options (pisahkan dengan koma)</label>
                <input v-model="itemForm.options" class="input" placeholder="Complete, Incomplete, N/A" />
            </div>
        </AppModal>
    </div>
</template>
