<script setup>
import { ref, onMounted } from 'vue';
import { api, formatMoney } from '../../../services/api';
import EmptyState from '../../../components/ui/EmptyState.vue';

const props = defineProps({ dockId: { type: String, required: true } });

const summary = ref(null);
const details = ref([]);
const loading = ref(true);

async function load() {
    loading.value = true;
    try {
        const data = await api.get(`/dry-docks/${props.dockId}/costs`);
        summary.value = data.summary;
        details.value = data.details;
    } finally {
        loading.value = false;
    }
}

async function copyYard() {
    await api.post(`/dry-docks/${props.dockId}/costs/copy-yard-estimates`);
    alert('Yard estimates disalin ke actual costs.');
    await load();
}

function exportPage() {
    window.print();
}

onMounted(load);
</script>

<template>
    <div>
        <div class="mb-3 flex justify-end gap-2">
            <button class="btn-secondary" @click="copyYard">Copy Yard Estimates to Actual</button>
            <button class="btn-secondary" @click="exportPage">Export</button>
        </div>

        <EmptyState v-if="loading" loading />

        <template v-else-if="summary">
            <h3 class="mb-3 text-lg font-semibold text-slate-800">Summary</h3>
            <div class="card mb-6 grid gap-4 p-5 sm:grid-cols-4">
                <div>
                    <p class="label">Budget</p>
                    <p class="text-lg font-bold text-slate-800">{{ formatMoney(summary.budget) }}</p>
                </div>
                <div>
                    <p class="label">Yard Estimates</p>
                    <p class="text-lg font-bold text-slate-800">{{ formatMoney(summary.yard_estimates) }}</p>
                </div>
                <div>
                    <p class="label">Owner Estimates</p>
                    <p class="text-lg font-bold text-slate-800">{{ formatMoney(summary.owner_estimates) }}</p>
                </div>
                <div>
                    <p class="label">Total Estimates</p>
                    <p class="text-lg font-bold text-primary-700">{{ formatMoney(summary.total_estimates) }}</p>
                </div>
                <div>
                    <p class="label">Actual Yard Costs</p>
                    <p class="text-lg font-bold text-slate-800">{{ formatMoney(summary.actual_yard_costs) }}</p>
                </div>
                <div>
                    <p class="label">Actual Owner Costs</p>
                    <p class="text-lg font-bold text-slate-800">{{ formatMoney(summary.actual_owner_costs) }}</p>
                </div>
                <div>
                    <p class="label">Total Costs</p>
                    <p class="text-lg font-bold text-primary-700">{{ formatMoney(summary.total_costs) }}</p>
                </div>
                <div>
                    <p class="label">Variance</p>
                    <p class="text-lg font-bold" :class="summary.variance >= 0 ? 'text-emerald-600' : 'text-red-600'">
                        {{ formatMoney(Math.abs(summary.variance)) }} {{ summary.variance >= 0 ? '⇡' : '⇣' }}
                    </p>
                </div>
            </div>

            <h3 class="mb-3 text-lg font-semibold text-slate-800">Details</h3>
            <EmptyState v-if="details.length === 0" message="Belum ada work order di dock ini." />
            <div v-else class="card overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="table-head">
                        <tr>
                            <th class="px-4 py-3">Job Code</th>
                            <th class="px-4 py-3">Job Name</th>
                            <th class="px-4 py-3 text-right">Owner Estimate</th>
                            <th class="px-4 py-3 text-right">Actual (Budget)</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="row in details" :key="row.dock_wo_id" class="hover:bg-slate-50">
                            <td class="px-4 py-3 font-medium text-slate-700">{{ row.job_code }}</td>
                            <td class="px-4 py-3 text-slate-600">{{ row.job_name }}</td>
                            <td class="px-4 py-3 text-right">{{ formatMoney(row.internal_estimate) }}</td>
                            <td class="px-4 py-3 text-right font-semibold">{{ formatMoney(row.budget) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>
    </div>
</template>
