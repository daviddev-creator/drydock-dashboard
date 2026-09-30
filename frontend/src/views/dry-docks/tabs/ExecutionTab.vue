<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../../../services/api';
import TabsNav from '../../../components/ui/TabsNav.vue';
import StatusBadge from '../../../components/ui/StatusBadge.vue';
import AppModal from '../../../components/ui/AppModal.vue';
import EmptyState from '../../../components/ui/EmptyState.vue';

const props = defineProps({ dockId: { type: String, required: true } });

const subTab = ref('updates');
const subTabs = [
    { key: 'updates', label: 'Updates' },
    { key: 'facts', label: 'Dry Dock Facts' },
    { key: 'meetings', label: 'Meetings' },
    { key: 'variation-orders', label: 'Variation Orders' },
];

const updates = ref([]);
const facts = ref([]);
const meetings = ref([]);
const variationOrders = ref([]);
const loading = ref(true);

const groupedUpdates = computed(() => {
    const map = new Map();
    for (const row of updates.value) {
        const key = row.spec_group_name ?? 'Tanpa Group';
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(row);
    }
    return [...map.entries()].map(([name, list]) => ({ name, list }));
});

const FACT_FIELDS = [
    { key: 'arriving_dock', label: 'Arriving Dock' },
    { key: 'bow_entering', label: 'Bow Entering Dry Dock' },
    { key: 'gate_closed', label: 'Gate Closed, Floating Dock' },
    { key: 'emptying_dock', label: 'Commenced Emptying Dock' },
    { key: 'vessel_on_blocks', label: 'Vessel On Blocks' },
    { key: 'dry_dock', label: 'Dry Dock' },
    { key: 'flooding_dock', label: 'Commenced Flooding Dock' },
    { key: 'gate_opened', label: 'Gate Opened, Floating Dock' },
    { key: 'dock_master_onboard', label: 'Dock Master onboard' },
    { key: 'undocking', label: 'Undocking, Vessel out of dock' },
    { key: 'leaving_yard', label: 'Leaving yard' },
    { key: 'dock_master_onboard_out', label: 'Dock Master onboard' },
    { key: 'alongside_from', label: 'Along Side pier from' },
    { key: 'alongside_to', label: 'Along Side pier To' },
];

const factsForm = ref({});

async function load() {
    loading.value = true;
    try {
        [updates.value, facts.value, meetings.value, variationOrders.value] = await Promise.all([
        api.get(`/dry-docks/${props.dockId}/updates`),
        api.get(`/dry-docks/${props.dockId}/facts`),
        api.get(`/dry-docks/${props.dockId}/meetings`),
        api.get(`/dry-docks/${props.dockId}/variation-orders`),
        ]);
        const map = Object.fromEntries(facts.value.map((f) => [f.fact_key, (f.occurred_at ?? '').slice(0, 16)]));
        factsForm.value = Object.fromEntries(FACT_FIELDS.map((f) => [f.key, map[f.key] ?? '']));
    } finally {
        loading.value = false;
    }
}

const showUpdateModal = ref(false);
const updateForm = ref({ dock_work_order_id: '', progress: 0, note: '', updated_by: '' });

async function saveUpdate() {
    await api.post(`/dry-docks/${props.dockId}/updates`, {
        ...updateForm.value,
        mark_complete: updateForm.value.progress >= 100,
    });
    showUpdateModal.value = false;
    updateForm.value = { dock_work_order_id: '', progress: 0, note: '', updated_by: '' };
    await load();
}

async function saveFacts() {
    await api.put(`/dry-docks/${props.dockId}/facts`, { facts: factsForm.value });
    alert('Dry dock facts tersimpan.');
}

const showMeetingModal = ref(false);
const meetingForm = ref({ title: '', meeting_date: '', attendees: '', notes: '' });

async function addMeeting() {
    await api.post(`/dry-docks/${props.dockId}/meetings`, meetingForm.value);
    showMeetingModal.value = false;
    meetingForm.value = { title: '', meeting_date: '', attendees: '', notes: '' };
    await load();
}

onMounted(load);
</script>

<template>
    <div>
        <TabsNav v-model="subTab" :tabs="subTabs" />
        <EmptyState v-if="loading" loading />

        <div v-if="subTab === 'updates' && !loading">
            <div class="mb-3 flex justify-end">
                <button class="btn-primary" @click="showUpdateModal = true">+ Add Specification Update</button>
            </div>
            <section v-for="group in groupedUpdates" :key="group.name" class="mb-6">
                <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{{ group.name }}</h3>
                <div class="card divide-y divide-slate-100">
                    <div v-for="row in group.list" :key="row.dock_wo_id" class="px-4 py-3">
                        <div class="flex flex-wrap items-center gap-3">
                            <StatusBadge :status="row.status" />
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-sm font-medium text-slate-800">
                                    {{ row.job_code }} {{ row.job_name }}
                                </p>
                                <p class="text-xs text-slate-500">
                                    <template v-if="row.latest_update">
                                        Responsible User: {{ row.latest_update.updated_by }} | Progress: {{
                                        row.latest_update.progress }}%
                                    </template>
                                    <template v-else>Belum ada update</template>
                                </p>
                            </div>
                            <div class="w-32">
                                <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div class="h-full rounded-full bg-primary-500 transition-all"
                                        :style="{ width: `${row.latest_update?.progress ?? 0}%` }" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div v-if="subTab === 'facts' && !loading" class="card max-w-2xl p-5">
            <h3 class="mb-4 font-semibold text-slate-800">Enter the Dry Dock Facts</h3>
            <div class="space-y-3">
                <div v-for="field in FACT_FIELDS" :key="field.key">
                    <label class="label">{{ field.label }}</label>
                    <input v-model="factsForm[field.key]" type="datetime-local" class="input" />
                </div>
            </div>
            <button class="btn-primary mt-4" @click="saveFacts">Update</button>
        </div>

        <div v-if="subTab === 'meetings' && !loading">
            <div class="mb-3 flex justify-end">
                <button class="btn-primary" @click="showMeetingModal = true">+ Add Meeting</button>
            </div>
            <EmptyState v-if="meetings.length === 0" message="Belum ada meeting." />
            <div v-else class="card divide-y divide-slate-100">
                <div v-for="meeting in meetings" :key="meeting.id" class="px-4 py-3.5">
                    <div class="flex items-center justify-between">
                        <p class="text-sm font-semibold text-slate-800">{{ meeting.title }}</p>
                        <span class="text-xs text-slate-500">
                            {{ meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleString() : '—' }}
                        </span>
                    </div>
                    <p class="text-xs text-slate-500">Attendees: {{ meeting.attendees || '—' }}</p>
                    <p class="mt-1 text-sm text-slate-600">{{ meeting.notes }}</p>
                </div>
            </div>
        </div>

        <div v-if="subTab === 'variation-orders' && !loading">
            <EmptyState v-if="variationOrders.length === 0" message="Belum ada variation order." />
            <div v-else class="card divide-y divide-slate-100">
                <div v-for="vo in variationOrders" :key="vo.id" class="flex flex-wrap items-center gap-3 px-4 py-3.5">
                    <StatusBadge :status="vo.status" />
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-slate-800">{{ vo.title }}</p>
                        <p class="truncate text-xs text-slate-500">{{ vo.job_name ?? '—' }}</p>
                    </div>
                    <span class="text-sm font-semibold text-slate-700">{{ vo.cost?.toLocaleString() }}$</span>
                </div>
            </div>
        </div>

        <AppModal :open="showUpdateModal" title="Add Specification Update" @close="showUpdateModal = false"
            @save="saveUpdate">
            <div>
                <label class="label">Work Order</label>
                <select v-model="updateForm.dock_work_order_id" class="input form-select pr-3">
                    <option value="">— Pilih work order di dock —</option>
                    <option v-for="row in updates" :key="row.dock_wo_id" :value="row.dock_wo_id">
                        {{ row.job_code }} — {{ row.job_name }}
                    </option>
                </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Progress (%)</label>
                    <input v-model.number="updateForm.progress" type="number" min="0" max="100" class="input" />
                </div>
                <div>
                    <label class="label">Updated By</label>
                    <input v-model="updateForm.updated_by" class="input" placeholder="Nama user" />
                </div>
            </div>
            <div>
                <label class="label">Note</label>
                <textarea v-model="updateForm.note" rows="2" class="input" />
            </div>
        </AppModal>

        <AppModal :open="showMeetingModal" title="Add Meeting" @close="showMeetingModal = false" @save="addMeeting">
            <div>
                <label class="label">Title</label>
                <input v-model="meetingForm.title" class="input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Meeting Date</label>
                    <input v-model="meetingForm.meeting_date" type="datetime-local" class="input" />
                </div>
                <div>
                    <label class="label">Attendees</label>
                    <input v-model="meetingForm.attendees" class="input" />
                </div>
            </div>
            <div>
                <label class="label">Notes</label>
                <textarea v-model="meetingForm.notes" rows="3" class="input" />
            </div>
        </AppModal>
    </div>
</template>
