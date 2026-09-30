<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api, formatMoney } from '../../services/api';
import TabsNav from '../../components/ui/TabsNav.vue';
import StatusBadge from '../../components/ui/StatusBadge.vue';
import DetailField from '../../components/ui/DetailField.vue';
import EmptyState from '../../components/ui/EmptyState.vue';
import SpecTab from './tabs/SpecTab.vue';
import TasksTab from './tabs/TasksTab.vue';
import SourcingTab from './tabs/SourcingTab.vue';
import ExecutionTab from './tabs/ExecutionTab.vue';
import ReportingTab from './tabs/ReportingTab.vue';
import CostsTab from './tabs/CostsTab.vue';
import POsTab from './tabs/POsTab.vue';

const route = useRoute();
const router = useRouter();

const dock = ref(null);
const shipyards = ref([]);
const loading = ref(true);
const savingGeneral = ref(false);
const activeTab = ref('general');

const tabs = [
    { key: 'general', label: 'General' },
    { key: 'specifications', label: 'Specifications' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'sourcing', label: 'Sourcing' },
    { key: 'execution', label: 'Execution' },
    { key: 'reporting', label: 'Reporting' },
    { key: 'costs', label: 'Costs' },
    { key: 'purchase-orders', label: 'Purchase Orders' },
];

async function load() {
    loading.value = true;
    try {
        dock.value = await api.get(`/dry-docks/${route.params.id}`);
        if (shipyards.value.length === 0) shipyards.value = await api.get('/shipyards');
    } finally {
        loading.value = false;
    }
}

async function saveGeneral() {
    savingGeneral.value = true;
    try {
        await api.put(`/dry-docks/${dock.value.id}`, {
        company: dock.value.company,
        account_code: dock.value.account_code,
        responsible_rank: dock.value.responsible_rank,
        budget: dock.value.budget,
        currency: dock.value.currency,
        planned_start: dock.value.planned_start,
        planned_end: dock.value.planned_end,
        actual_start: dock.value.actual_start,
        actual_end: dock.value.actual_end,
        shipyard_id: dock.value.shipyard_id,
        priority: dock.value.priority,
        status: dock.value.status,
        });
        await load();
        alert('General tersimpan.');
    } finally {
        savingGeneral.value = false;
    }
}

onMounted(load);
</script>

<template>
    <div class="p-6">
        <button class="btn-secondary mb-4" @click="router.push('/dry-docks')">← Back</button>
        <EmptyState v-if="loading" loading />

        <template v-else-if="dock">
            <div class="mb-5">
                <p class="text-sm font-medium text-slate-500">{{ dock.vessel_name }}</p>
                <h1 class="text-2xl font-bold text-slate-800">{{ dock.dock_no }}</h1>
                <p class="mt-0.5 text-sm text-slate-500">{{ dock.description }}</p>
            </div>

            <TabsNav v-model="activeTab" :tabs="tabs" />

            <div v-if="activeTab === 'general'" class="space-y-6">
                <div class="grid gap-4 lg:grid-cols-2">
                    <div class="card space-y-4 p-5">
                        <div class="grid grid-cols-2 gap-4">
                            <DetailField label="Dry Dock No" :value="dock.dock_no" />
                            <DetailField label="Description" :value="dock.description" />
                            <DetailField label="Company" :value="dock.company" />
                            <DetailField label="Account Code" :value="dock.account_code" />
                            <DetailField label="Responsible Rank" :value="dock.responsible_rank" />
                            <DetailField label="Budget" :value="formatMoney(dock.budget, dock.currency)" />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="label">Planned Start Date</label>
                                <input v-model="dock.planned_start" type="date" class="input" />
                            </div>
                            <div>
                                <label class="label">Planned End Date</label>
                                <input v-model="dock.planned_end" type="date" class="input" />
                            </div>
                            <div>
                                <label class="label">Actual Start Date</label>
                                <input v-model="dock.actual_start" type="date" class="input" />
                            </div>
                            <div>
                                <label class="label">Actual End Date</label>
                                <input v-model="dock.actual_end" type="date" class="input" />
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="card space-y-3 p-5">
                            <div>
                                <label class="label">Shipyard</label>
                                <select v-model="dock.shipyard_id" class="input form-select pr-3">
                                    <option :value="null">— Belum ditentukan —</option>
                                    <option v-for="s in shipyards" :key="s.id" :value="s.id">{{ s.name }}</option>
                                </select>
                            </div>
                            <div>
                                <label class="label">Priority</label>
                                <select v-model="dock.priority" class="input form-select pr-3">
                                    <option>High</option>
                                    <option>Medium</option>
                                    <option>Low</option>
                                </select>
                            </div>
                            <div>
                                <label class="label">Status</label>
                                <select v-model="dock.status" class="input form-select pr-3">
                                    <option>Planning</option>
                                    <option>Execution</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                            <button class="btn-primary" :disabled="savingGeneral" @click="saveGeneral">Update
                                General</button>
                        </div>

                        <div v-if="dock.status_counts?.length" class="card p-5">
                            <h3 class="mb-3 font-semibold text-slate-800">Status Work Order</h3>
                            <div class="grid grid-cols-2 gap-3">
                                <div v-for="stat in dock.status_counts" :key="stat.status"
                                    class="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                    <StatusBadge :status="stat.status" />
                                    <span class="font-bold text-slate-700">{{ stat.total }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="dock.cost_summary" class="card p-5">
                    <h3 class="mb-3 font-semibold text-slate-800">Cost Summary</h3>
                    <div class="grid gap-4 sm:grid-cols-4 lg:grid-cols-8">
                        <div>
                            <p class="label">Budget</p>
                            <p class="font-bold text-slate-800">{{ formatMoney(dock.cost_summary.budget) }}</p>
                        </div>
                        <div>
                            <p class="label">Yard Estimates</p>
                            <p class="font-bold text-slate-800">{{ formatMoney(dock.cost_summary.yard_estimates) }}</p>
                        </div>
                        <div>
                            <p class="label">Owner Estimates</p>
                            <p class="font-bold text-slate-800">{{ formatMoney(dock.cost_summary.owner_estimates) }}</p>
                        </div>
                        <div>
                            <p class="label">Total Estimates</p>
                            <p class="font-bold text-primary-700">{{ formatMoney(dock.cost_summary.total_estimates) }}
                            </p>
                        </div>
                        <div>
                            <p class="label">Actual Yard Costs</p>
                            <p class="font-bold text-slate-800">{{ formatMoney(dock.cost_summary.actual_yard_costs) }}
                            </p>
                        </div>
                        <div>
                            <p class="label">Actual Owner Costs</p>
                            <p class="font-bold text-slate-800">{{ formatMoney(dock.cost_summary.actual_owner_costs) }}
                            </p>
                        </div>
                        <div>
                            <p class="label">Total Costs</p>
                            <p class="font-bold text-primary-700">{{ formatMoney(dock.cost_summary.total_costs) }}</p>
                        </div>
                        <div>
                            <p class="label">Variance</p>
                            <p class="font-bold"
                                :class="dock.cost_summary.variance >= 0 ? 'text-emerald-600' : 'text-red-600'">
                                {{ formatMoney(Math.abs(dock.cost_summary.variance)) }} 
                                {{ dock.cost_summary.variance >= 0 ? '⇡' : '⇣' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <SpecTab v-if="activeTab === 'specifications'" :dock-id="route.params.id" @refresh="load" />
            <TasksTab v-if="activeTab === 'tasks'" :dock-id="route.params.id" />
            <SourcingTab v-if="activeTab === 'sourcing'" :dock-id="route.params.id" />
            <ExecutionTab v-if="activeTab === 'execution'" :dock-id="route.params.id" />
            <ReportingTab v-if="activeTab === 'reporting'" :dock-id="route.params.id" />
            <CostsTab v-if="activeTab === 'costs'" :dock-id="route.params.id" />
            <POsTab v-if="activeTab === 'purchase-orders'" :dock-id="route.params.id" />
        </template>
    </div>
</template>
