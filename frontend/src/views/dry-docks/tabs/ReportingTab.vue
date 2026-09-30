<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../../services/api';
import AppModal from '../../../components/ui/AppModal.vue';
import EmptyState from '../../../components/ui/EmptyState.vue';

const props = defineProps({ dockId: { type: String, required: true } });

const reports = ref([]);
const loading = ref(true);
const showAdd = ref(false);
const form = ref({ title: '', author: '', report_date: '', content: '' });

async function load() {
    loading.value = true;
    try {
        reports.value = await api.get(`/dry-docks/${props.dockId}/reports`);
    } finally {
        loading.value = false;
    }
}

async function add() {
    await api.post(`/dry-docks/${props.dockId}/reports`, form.value);
    showAdd.value = false;
    form.value = { title: '', author: '', report_date: '', content: '' };
    await load();
}

onMounted(load);
</script>

<template>
    <div>
        <div class="mb-3 flex justify-end">
            <button class="btn-primary" @click="showAdd = true">+ Add Report</button>
        </div>
        <EmptyState v-if="loading" loading />
        <EmptyState v-else-if="reports.length === 0" message="Belum ada daily report." />

        <div v-else class="card divide-y divide-slate-100">
            <details v-for="report in reports" :key="report.id" class="px-4 py-3.5">
                <summary class="cursor-pointer">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <span class="text-sm font-semibold text-slate-800">{{ report.title }} by {{ report.author
                            }}</span>
                        <span class="text-xs text-slate-500">{{ report.report_date }}</span>
                    </div>
                </summary>
                <p class="mt-2 whitespace-pre-line text-sm text-slate-600">{{ report.content }}</p>
            </details>
        </div>

        <AppModal :open="showAdd" title="Add Daily Report" @close="showAdd = false" @save="add">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Title</label>
                    <input v-model="form.title" class="input" />
                </div>
                <div>
                    <label class="label">Author</label>
                    <input v-model="form.author" class="input" />
                </div>
            </div>
            <div>
                <label class="label">Report Date</label>
                <input v-model="form.report_date" type="date" class="input" />
            </div>
            <div>
                <label class="label">Content</label>
                <textarea v-model="form.content" rows="4" class="input" />
            </div>
        </AppModal>
    </div>
</template>
