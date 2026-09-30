<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, formatMoney } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.vue';
import TabsNav from '../../components/ui/TabsNav.vue';
import StatusBadge from '../../components/ui/StatusBadge.vue';
import DetailField from '../../components/ui/DetailField.vue';
import AppModal from '../../components/ui/AppModal.vue';
import EmptyState from '../../components/ui/EmptyState.vue';

const route = useRoute();
const router = useRouter();

const wo = ref(null);
const dryDocks = ref([]);
const activeChecklists = ref([]);
const loading = ref(true);
const activeTab = ref('general');
const activeChecklistId = ref(null);

const tabs = [
    { key: 'general', label: 'General' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'purchase-orders', label: 'Purchase Orders' },
];

const tasksByStatus = computed(() => {
    const map = { Open: [], 'In Progress': [], Closed: [] };
    for (const t of wo.value?.tasks ?? []) (map[t.status] ?? map.Open).push(t);
    return map;
});

const posByCategory = computed(() => {
    const map = {};
    for (const po of wo.value?.purchase_orders ?? []) (map[po.category] ??= []).push(po);
    return map;
});

async function load() {
    loading.value = true;
    try {
        wo.value = await api.get(`/work-orders/${route.params.id}`);
        if (dryDocks.value.length === 0) {
            [dryDocks.value, activeChecklists.value] = await Promise.all([
                api.get('/dry-docks'),
                api.get('/checklists'),
            ]);
            activeChecklists.value = activeChecklists.value.filter((c) => c.active);
        }
    } finally {
        loading.value = false;
    }
}

const showSpecModal = ref(false);
const specForm = ref({ dry_dock_id: '', location: '' });

async function addToSpec() {
    await api.post(`/work-orders/${wo.value.id}/add-to-spec`, specForm.value);
    showSpecModal.value = false;
    alert('Work order ditambahkan ke spesifikasi dry dock.');
}

const showSubJobModal = ref(false);
const subJobForm = ref({ title: '', description: '' });

async function addSubJob() {
    await api.post(`/work-orders/${wo.value.id}/sub-jobs`, subJobForm.value);
    showSubJobModal.value = false;
    subJobForm.value = { title: '', description: '' };
    await load();
}

const showTaskModal = ref(false);
const taskForm = ref({ title: '', responsibility: '', due_date: '', description: '' });

async function addTask() {
    await api.post(`/work-orders/${wo.value.id}/tasks`, taskForm.value);
    showTaskModal.value = false;
    taskForm.value = { title: '', responsibility: '', due_date: '', description: '' };
    await load();
}

async function setTaskStatus(task, status) {
    await api.put(`/work-orders/${wo.value.id}/tasks/${task.id}`, { status });
    await load();
}

const showChecklistModal = ref(false);
const checklistForm = ref({ checklist_id: '' });

async function attachChecklist() {
    await api.post(`/work-orders/${wo.value.id}/checklists`, checklistForm.value);
    showChecklistModal.value = false;
    await load();
}

async function saveChecklistAnswers(checklist) {
    const answers = checklist.items.map((i) => ({ checklist_item_id: i.id, value: i.value }));
    await api.put(`/work-orders/${wo.value.id}/checklists/${checklist.id}`, {
        remarks: checklist.remarks,
        completed: checklist.completed,
        answers,
    });
    alert('Checklist tersimpan.');
}

onMounted(load);
</script>

<template>
    <div class="p-6">
        <button class="btn-secondary mb-4" @click="router.back()">← Back</button>
        <EmptyState v-if="loading" loading />

        <template v-else-if="wo">
            <PageHeader :title="wo.job_name" :subtitle="`${wo.job_code} · ${wo.spec_group_name ?? 'Tanpa group'}`">
                <button class="btn-primary" @click="showSpecModal = true">Add to Specification</button>
            </PageHeader>

            <TabsNav v-model="activeTab" :tabs="tabs" />

            <!-- ============================ GENERAL ============================ -->
            <div v-if="activeTab === 'general'" class="space-y-6">
                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="card space-y-4 p-5">
                        <div class="grid grid-cols-2 gap-4">
                            <DetailField label="Job Category" :value="wo.job_category" />
                            <DetailField label="Job Type" :value="wo.job_type" />
                            <DetailField label="Job Code" :value="wo.job_code" />
                            <DetailField label="Estimated Hours" :value="wo.estimated_hours" />
                            <DetailField label="Critical Job" :value="wo.critical_job ? 'Yes' : 'No'" />
                            <DetailField label="Internal Job" :value="wo.internal_job ? 'Yes' : 'No'" />
                            <DetailField label="Specification Group" :value="wo.spec_group_name" />
                            <DetailField label="Vessel" :value="wo.vessel_name" />
                            <DetailField label="Machinery Group" :value="wo.machinery_group" />
                            <DetailField label="Machinery" :value="wo.machinery" />
                        </div>
                        <div v-if="wo.description">
                            <p class="label">Description</p>
                            <p class="whitespace-pre-line text-sm text-slate-700">{{ wo.description }}</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="card p-5">
                            <h3 class="mb-3 font-semibold text-slate-800">Responsible Rank</h3>
                            <p class="text-lg font-medium text-slate-700">{{ wo.responsible_rank || '—' }}</p>
                        </div>
                        <div class="card p-5">
                            <h3 class="mb-3 font-semibold text-slate-800">Costs</h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-slate-500">Total Budget</span>
                                    <span class="font-semibold text-slate-800">{{ formatMoney(wo.budget) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-slate-500">Total Internal Estimate</span>
                                    <span class="font-semibold text-slate-800">{{ formatMoney(wo.internal_estimate)
                                        }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sub Jobs -->
                <section class="card p-5">
                    <div class="mb-3 flex items-center justify-between">
                        <h3 class="font-semibold text-slate-800">Sub Jobs</h3>
                        <button class="btn-secondary !py-1 text-xs" @click="showSubJobModal = true">+ Add</button>
                    </div>
                    <EmptyState v-if="wo.sub_jobs.length === 0" message="Belum ada sub job." />
                    <ul v-else class="divide-y divide-slate-100">
                        <li v-for="sj in wo.sub_jobs" :key="sj.id" class="flex items-center gap-3 py-2.5">
                            <StatusBadge :status="sj.status" />
                            <div class="flex-1">
                                <p class="text-sm font-medium text-slate-700">{{ sj.title }}</p>
                                <p class="text-xs text-slate-500">{{ sj.description }}</p>
                            </div>
                        </li>
                    </ul>
                </section>

                <!-- Related Spares -->
                <section class="card p-5">
                    <h3 class="mb-3 font-semibold text-slate-800">Related Spares</h3>
                    <table class="w-full text-sm">
                        <thead class="table-head">
                            <tr>
                                <th class="px-3 py-2">Spare</th>
                                <th class="px-3 py-2 text-right">Expected Qty</th>
                                <th class="px-3 py-2 text-right">Cost (USD)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="spare in wo.spares" :key="spare.id" class="hover:bg-slate-50">
                                <td class="px-3 py-2 text-slate-700">{{ spare.name }}</td>
                                <td class="px-3 py-2 text-right">{{ spare.expected_qty }}</td>
                                <td class="px-3 py-2 text-right">{{ formatMoney(spare.cost) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <!-- Attachments -->
                <section class="card p-5">
                    <h3 class="mb-3 font-semibold text-slate-800">Attachments</h3>
                    <ul class="divide-y divide-slate-100">
                        <li v-for="file in wo.attachments" :key="file.id"
                            class="flex items-center gap-3 py-2.5 text-sm">
                            <span class="text-lg">📄</span>
                            <span class="flex-1 font-medium text-slate-700">{{ file.file_name }}</span>
                            <span class="text-xs text-slate-500">Include in Specs: {{ file.include_in_specs ? 'Yes' :
                                'No' }}</span>
                        </li>
                    </ul>
                </section>

                <!-- Checklists -->
                <section class="card p-5">
                    <div class="mb-3 flex items-center justify-between">
                        <h3 class="font-semibold text-slate-800">Checklists</h3>
                        <button class="btn-secondary !py-1 text-xs" @click="showChecklistModal = true">+ Add
                            Checklist</button>
                    </div>
                    <EmptyState v-if="wo.checklists.length === 0" message="Belum ada checklist pada work order ini." />
                    <div v-else class="space-y-3">
                        <details v-for="wc in wo.checklists" :key="wc.id" class="rounded-lg border border-slate-200"
                            @toggle="wc.id === activeChecklistId || (activeChecklistId = wc.id)">
                            <summary class="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700">
                                {{ wc.name }}
                                <span class="ml-2 text-xs font-normal"
                                    :class="wc.completed ? 'text-emerald-600' : 'text-slate-400'">
                                    {{ wc.completed ? '✓ Complete' : 'Belum complete' }}
                                </span>
                            </summary>
                            <div class="space-y-3 border-t border-slate-100 px-4 py-4">
                                <div>
                                    <label class="label">Remarks</label>
                                    <input v-model="wc.remarks" class="input" placeholder="Remarks…" />
                                </div>
                                <label class="flex items-center gap-2 text-sm text-slate-700">
                                    <input v-model="wc.completed" type="checkbox"
                                        class="h-4 w-4 rounded border-slate-300" />
                                    Mark as Complete
                                </label>

                                <div v-for="item in wc.items" :key="item.id" class="rounded-lg bg-slate-50 p-3">
                                    <p class="mb-1.5 text-sm font-medium text-slate-700">{{ item.title }}</p>
                                    <!-- pilihan tunggal -->
                                    <select v-if="item.data_type === 'single_choice'" v-model="item.value"
                                        class="input">
                                        <option value="">— Pilih —</option>
                                        <option v-for="opt in item.options" :key="opt" :value="opt">{{ opt }}</option>
                                    </select>
                                    <!-- pilihan ganda -->
                                    <div v-else-if="item.data_type === 'multiple_choice'" class="flex flex-wrap gap-2">
                                        <label v-for="opt in item.options" :key="opt"
                                            class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700">
                                            <input v-model="item.value" type="checkbox" :value="opt"
                                                :checked="(item.value || '').includes(opt)"
                                                @change="item.value = $event.target.checked ? [...new Set([...(item.value || '').split('|').filter(Boolean), opt])].join('|') : (item.value || '').split('|').filter((v) => v !== opt).join('|')" />
                                            {{ opt }}
                                        </label>
                                    </div>
                                    <!-- angka / meter reading -->
                                    <input v-else-if="item.data_type === 'number' || item.data_type === 'meter_reading'"
                                        v-model="item.value" type="number" class="input" />
                                    <!-- teks -->
                                    <textarea v-else-if="item.data_type === 'text'" v-model="item.value" rows="2"
                                        class="input" />
                                    <!-- inspection (checkbox) -->
                                    <label v-else class="flex items-center gap-2 text-sm text-slate-600">
                                        <input v-model="item.value" type="checkbox" true-value="Yes" false-value="No"
                                            class="h-4 w-4 rounded border-slate-300" />
                                        Checked
                                    </label>
                                </div>

                                <button class="btn-primary" @click="saveChecklistAnswers(wc)">Simpan Checklist</button>
                            </div>
                        </details>
                    </div>
                </section>
            </div>

            <!-- ============================ TASKS ============================ -->
            <div v-if="activeTab === 'tasks'">
                <div class="mb-3 flex justify-end">
                    <button class="btn-primary" @click="showTaskModal = true">+ Add Task</button>
                </div>
                <div class="grid gap-4 lg:grid-cols-3">
                    <section v-for="status in ['Open', 'In Progress', 'Closed']" :key="status">
                        <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{{ status }}</h3>
                        <div class="space-y-2">
                            <div v-for="task in tasksByStatus[status]" :key="task.id" class="card p-4">
                                <div class="flex items-start justify-between gap-2">
                                    <p class="text-sm font-semibold text-slate-800">{{ task.title }}</p>
                                    <select
                                        class="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-600"
                                        :value="task.status" @change="setTaskStatus(task, $event.target.value)">
                                        <option>Open</option>
                                        <option>In Progress</option>
                                        <option>Closed</option>
                                    </select>
                                </div>
                                <p class="mt-1 text-xs text-slate-500">
                                    Responsibility {{ task.responsibility || '—' }}<template v-if="task.due_date">, Due:
                                        {{ task.due_date }}</template>
                                </p>
                                <p class="mt-1.5 line-clamp-3 text-xs text-slate-600">{{ task.description }}</p>
                            </div>
                            <p v-if="tasksByStatus[status].length === 0"
                                class="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
                                Kosong
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <!-- ======================== PURCHASE ORDERS ======================== -->
            <div v-if="activeTab === 'purchase-orders'" class="space-y-6">
                <section v-for="(list, category) in posByCategory" :key="category">
                    <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{{ category }}</h3>
                    <div class="card overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="table-head">
                                <tr>
                                    <th class="px-4 py-3">Purchase Order no.</th>
                                    <th class="px-4 py-3 text-right">Total (USD)</th>
                                    <th class="px-4 py-3">Supplier</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="po in list" :key="po.id" class="hover:bg-slate-50">
                                    <td class="px-4 py-3 font-medium text-slate-700">{{ po.po_no }}</td>
                                    <td class="px-4 py-3 text-right">{{ formatMoney(po.total) }}</td>
                                    <td class="px-4 py-3 text-slate-600">{{ po.supplier }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </template>

        <!-- Modals -->
        <AppModal :open="showSpecModal" title="Add to Specification" @close="showSpecModal = false" @save="addToSpec">
            <div>
                <label class="label">Dry Dock</label>
                <select v-model="specForm.dry_dock_id" class="input">
                    <option value="">— Pilih dry dock —</option>
                    <option v-for="dd in dryDocks" :key="dd.id" :value="dd.id">
                        {{ dd.vessel_name }} — {{ dd.dock_no }}
                    </option>
                </select>
            </div>
            <div>
                <label class="label">Location / Komponen</label>
                <input v-model="specForm.location" class="input" placeholder="Mis. No.2 Cargo Pump" />
            </div>
        </AppModal>

        <AppModal :open="showSubJobModal" title="Add Sub Job" @close="showSubJobModal = false" @save="addSubJob">
            <div>
                <label class="label">Title</label>
                <input v-model="subJobForm.title" class="input" />
            </div>
            <div>
                <label class="label">Description</label>
                <textarea v-model="subJobForm.description" rows="3" class="input" />
            </div>
        </AppModal>

        <AppModal :open="showTaskModal" title="Add Task" @close="showTaskModal = false" @save="addTask">
            <div>
                <label class="label">Title</label>
                <input v-model="taskForm.title" class="input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Responsibility</label>
                    <input v-model="taskForm.responsibility" class="input" />
                </div>
                <div>
                    <label class="label">Due Date</label>
                    <input v-model="taskForm.due_date" type="date" class="input" />
                </div>
            </div>
            <div>
                <label class="label">Description</label>
                <textarea v-model="taskForm.description" rows="3" class="input" />
            </div>
        </AppModal>

        <AppModal :open="showChecklistModal" title="Add Checklist" @close="showChecklistModal = false"
            @save="attachChecklist">
            <div>
                <label class="label">Checklist (hanya yang aktif)</label>
                <select v-model="checklistForm.checklist_id" class="input">
                    <option value="">— Pilih checklist —</option>
                    <option v-for="c in activeChecklists" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
            </div>
        </AppModal>
    </div>
</template>
