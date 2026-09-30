<script setup>
import { ref, computed, onMounted } from 'vue';
import { api, formatMoney } from '../../../services/api';
import TabsNav from '../../../components/ui/TabsNav.vue';
import StatusBadge from '../../../components/ui/StatusBadge.vue';
import SearchSelect from '../../../components/ui/SearchSelect.vue';
import AppModal from '../../../components/ui/AppModal.vue';
import EmptyState from '../../../components/ui/EmptyState.vue';

const props = defineProps({ dockId: { type: String, required: true } });

const subTab = ref('rfq');
const subTabs = [
    { key: 'rfq', label: 'RFQ' },
    { key: 'compare', label: 'Quote Compare' },
];

const rfqs = ref([]);
const compare = ref([]);
const approvals = ref([]);
const shipyards = ref([]);
const loading = ref(true);

const compareSelected = ref([]);
const comparedQuotes = computed(() =>
    compare.value.filter((q) => compareSelected.value.length === 0 || compareSelected.value.includes(q.shipyard_id)),
);

async function load() {
    loading.value = true;
    // catatan david: ini ada banyak data pake promise all hati hati kedalaman data
    try {
        [rfqs.value, compare.value, approvals.value, shipyards.value] = await Promise.all([
            api.get(`/dry-docks/${props.dockId}/rfqs`),
            api.get(`/dry-docks/${props.dockId}/quote-compare`),
            api.get(`/dry-docks/${props.dockId}/approvals`),
            api.get('/shipyards'),
        ]);
    } finally {
        loading.value = false;
    }
}

async function sendRfq(quote) {
    await api.put(`/dry-docks/${props.dockId}/rfqs/${quote.rfq_id}/quotations/${quote.id}`, { send: true });
    await load();
}

const showAddYard = ref(false);
const yardForm = ref({ rfq_id: '', shipyard_id: '' });

async function addYard() {
    await api.post(`/dry-docks/${props.dockId}/rfqs/${yardForm.value.rfq_id}/quotations`, {
        shipyard_id: yardForm.value.shipyard_id,
    });
    showAddYard.value = false;
    await load();
}

async function selectQuote(quote) {
    await api.put(`/dry-docks/${props.dockId}/rfqs/${quote.rfq_id}/quotations/${quote.id}`, { select: true });
    await load();
}

async function decideApproval(approval, status) {
    await api.put(`/dry-docks/${props.dockId}/approvals/${approval.id}`, { status });
    await load();
}

onMounted(load);
</script>

<template>
    <div>
        <TabsNav v-model="subTab" :tabs="subTabs" />

        <div v-if="subTab === 'rfq'">
            <EmptyState v-if="loading" loading />
            <EmptyState v-else-if="rfqs.length === 0" message="Belum ada RFQ untuk dock ini." />

            <div v-for="rfq in rfqs" :key="rfq.id" class="mb-6">
                <div class="card mb-4 grid gap-4 p-5 sm:grid-cols-4">
                    <div>
                        <p class="label">RFQ No.</p>
                        <p class="text-sm font-semibold text-slate-800">{{ rfq.rfq_no }}</p>
                    </div>
                    <div>
                        <p class="label">RFQ Date</p>
                        <p class="text-sm text-slate-700">{{ rfq.rfq_date }}</p>
                    </div>
                    <div>
                        <p class="label">RFQ Expiry date</p>
                        <p class="text-sm text-slate-700">{{ rfq.expiry_date }}</p>
                    </div>
                    <div>
                        <p class="label">RFQ comments</p>
                        <p class="text-sm text-slate-700">{{ rfq.comments }}</p>
                    </div>
                </div>

                <div class="mb-2 flex items-center justify-between">
                    <h3 class="text-sm font-bold uppercase tracking-wide text-slate-500">Selected Shipyards</h3>
                    <button class="btn-secondary !py-1 text-xs" @click="yardForm.rfq_id = rfq.id; showAddYard = true">+
                        Add</button>
                </div>
                <div class="card divide-y divide-slate-100">
                    <div v-for="quote in rfq.quotations" :key="quote.id"
                        class="flex flex-wrap items-center gap-3 px-4 py-3">
                        <StatusBadge :status="quote.status" />
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-slate-800">{{ quote.shipyard_name }}</p>
                            <p class="text-xs text-slate-500">
                                {{ quote.quote_date ? new Date(quote.quote_date).toLocaleString() : 'Belum ada quotation' }}
                            </p>
                        </div>
                        <span v-if="quote.total" class="text-sm font-semibold text-primary-700">{{
                            formatMoney(quote.total) }}</span>
                        <button v-if="quote.status === 'Not Sent'" class="btn-primary !px-3 !py-1 text-xs"
                            @click="sendRfq(quote)">
                            Send RFQ
                        </button>
                        <button v-else class="btn-secondary !px-3 !py-1 text-xs" @click="selectQuote(quote)">
                            {{ quote.selected ? '★ Selected' : 'Pilih' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="subTab === 'compare'">
            <div class="card mb-4 p-5">
                <h3 class="label">Comparing Yards</h3>
                <div class="flex flex-wrap gap-2">
                    <label v-for="yard in shipyards" :key="yard.id"
                        class="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
                        :class="compareSelected.includes(yard.id) ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600'">
                        <input v-model="compareSelected" type="checkbox" :value="yard.id"
                            class="h-4 w-4 rounded border-slate-300" />
                        {{ yard.name }}
                    </label>
                </div>
            </div>

            <div class="card mb-6 overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="table-head">
                        <tr>
                            <th class="px-4 py-3">Shipyard</th>
                            <th class="px-4 py-3">Quotation No</th>
                            <th class="px-4 py-3 text-right">Total (USD)</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="quote in comparedQuotes" :key="quote.id" class="hover:bg-slate-50">
                            <td class="px-4 py-3 font-medium text-slate-700">{{ quote.shipyard_name }}</td>
                            <td class="px-4 py-3 text-slate-600">{{ quote.quotation_no ?? '—' }}</td>
                            <td class="px-4 py-3 text-right font-semibold">{{ formatMoney(quote.total) }}</td>
                            <td class="px-4 py-3">
                                <StatusBadge :status="quote.status" />
                            </td>
                            <td class="px-4 py-3 text-right">
                                <button v-if="quote.total" class="btn-secondary !px-2.5 !py-1 text-xs"
                                    @click="selectQuote(quote)">
                                    {{ quote.selected ? '★ Selected' : 'Select' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 class="mb-2 text-lg font-semibold text-slate-800">Approvals</h3>
            <div class="card divide-y divide-slate-100">
                <div v-for="approval in approvals" :key="approval.id" class="flex items-center gap-3 px-4 py-3">
                    <span class="w-20 text-xs font-bold uppercase tracking-wide text-slate-400">Level {{ approval.level
                        }}</span>
                    <span class="flex-1 text-sm font-medium text-slate-700">{{ approval.approver }}</span>
                    <StatusBadge :status="approval.status" />
                    <template v-if="approval.status === 'Pending'">
                        <button class="btn-success !px-2.5 !py-1 text-xs"
                            @click="decideApproval(approval, 'Approved')">Approve</button>
                        <button class="btn-danger !px-2.5 !py-1 text-xs"
                            @click="decideApproval(approval, 'Rejected')">Reject</button>
                    </template>
                </div>
                <p v-if="approvals.length === 0" class="px-4 py-6 text-center text-sm text-slate-400">Belum ada
                    approval.</p>
            </div>
        </div>

        <AppModal :open="showAddYard" title="Tambah Galangan ke RFQ" @close="showAddYard = false" @save="addYard">
            <div>
                <label class="label">Shipyard</label>
                <SearchSelect v-model="yardForm.shipyard_id"
                    :options="shipyards.map((s) => ({ value: s.id, label: s.name }))" placeholder="Cari shipyard…" />
            </div>
        </AppModal>
    </div>
</template>
