<script setup>
import { ref, onMounted } from 'vue';
import { api, formatMoney } from '../../services/api';
import EmptyState from '../../components/ui/EmptyState.vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import KanbanBoard from './components/KanbanBoard.vue';

const data = ref(null);
const loading = ref(true);

async function load() {
    loading.value = true;
    try {
        data.value = await api.get('/dashboard');
    } finally {
        loading.value = false;
    }
}

onMounted(load);
</script>

<template>
    <div class="p-6">
        <PageHeader title="Dashboard" subtitle="Ringkasan seluruh aktivitas dry dock" />

        <div class="-mx-2 space-y-8 px-2">
            <KanbanBoard title="Quotes Pending Approval" board="quotes_pending_approval" />
            <KanbanBoard title="Pending Yard Quotes" board="pending_yard_quotes" />
            <KanbanBoard title="Jobs Awaiting Dock" board="jobs_awaiting_dock" />
        </div>

        <EmptyState v-if="loading" loading />

        <div v-else class="mt-8 space-y-8">
            <section>
                <h2 class="mb-3 text-lg font-semibold text-slate-800">Active Dry Docks</h2>
                <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div v-for="stat in data.active_dry_docks" :key="stat.status"
                        class="card flex items-center justify-between p-5">
                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="{
                            'bg-sky-100 text-sky-700': stat.status === 'Open',
                            'bg-amber-100 text-amber-700': stat.status === 'In Progress',
                            'bg-orange-100 text-orange-700': stat.status === 'On Hold',
                            'bg-emerald-100 text-emerald-700': stat.status === 'Complete',
                        }">
                            {{ stat.status }}
                        </span>
                        <span class="text-3xl font-bold text-slate-800">{{ stat.total }}</span>
                    </div>
                </div>
            </section>

            <section>
                <h2 class="mb-3 text-lg font-semibold text-slate-800">Costs</h2>
                <div class="card overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="table-head">
                            <tr>
                                <th class="px-4 py-3">Dry Dock</th>
                                <th class="px-4 py-3 text-right">Total Budget</th>
                                <th class="px-4 py-3 text-right">Total Estimates</th>
                                <th class="px-4 py-3 text-right">Total Costs</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="cost in data.costs" :key="cost.dock_no + cost.budget" class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-medium text-slate-700">{{ cost.dock_no }}</td>
                                <td class="px-4 py-3 text-right">{{ formatMoney(cost.budget) }}</td>
                                <td class="px-4 py-3 text-right">{{ formatMoney(cost.estimates) }}</td>
                                <td class="px-4 py-3 text-right font-semibold">{{ formatMoney(cost.costs) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </div>
</template>
