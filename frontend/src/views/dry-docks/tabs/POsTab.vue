<script setup>
import { ref, computed, onMounted } from 'vue';
import { api, formatMoney } from '../../../services/api';
import AppModal from '../../../components/ui/AppModal.vue';
import EmptyState from '../../../components/ui/EmptyState.vue';

const props = defineProps({ dockId: { type: String, required: true } });

const pos = ref([]);
const loading = ref(true);
const showAdd = ref(false);
const form = ref({ po_no: '', supplier: '', total: 0, category: 'Inventory' });

const CATEGORIES = ['Inventory', 'Spare part', 'Machinery'];

const byCategory = computed(() => {
    const map = {};
    for (const po of pos.value) (map[po.category] ??= []).push(po);
    return map;
});

async function load() {
    loading.value = true;
    try {
        pos.value = await api.get(`/dry-docks/${props.dockId}/purchase-orders`);
    } finally {
        loading.value = false;
    }
}

async function add() {
    await api.post(`/dry-docks/${props.dockId}/purchase-orders`, form.value);
    showAdd.value = false;
    form.value = { po_no: '', supplier: '', total: 0, category: 'Inventory' };
    await load();
}

onMounted(load);
</script>

<template>
    <div>
        <div class="mb-3 flex justify-end">
            <button class="btn-primary" @click="showAdd = true">+ Add</button>
        </div>
        <EmptyState v-if="loading" loading />
        <EmptyState v-else-if="pos.length === 0" message="Belum ada purchase order." />

        <section v-for="category in CATEGORIES" :key="category" class="mb-6">
            <template v-if="byCategory[category]?.length">
                <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{{ category }}</h3>
                <div class="card overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="table-head">
                            <tr>
                                <th class="px-4 py-3">Purchase Order No.</th>
                                <th class="px-4 py-3 text-right">Total (USD)</th>
                                <th class="px-4 py-3">Supplier</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="po in byCategory[category]" :key="po.id" class="hover:bg-slate-50">
                                <td class="px-4 py-3 font-medium text-slate-700">{{ po.po_no }}</td>
                                <td class="px-4 py-3 text-right">{{ formatMoney(po.total) }}</td>
                                <td class="px-4 py-3 text-slate-600">{{ po.supplier }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </section>

        <AppModal :open="showAdd" title="Add Purchase Order" @close="showAdd = false" @save="add">
            <div>
                <label class="label">PO No</label>
                <input v-model="form.po_no" class="input" placeholder="SW10/O/PO/21/0201" />
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Supplier</label>
                    <input v-model="form.supplier" class="input" />
                </div>
                <div>
                    <label class="label">Total (USD)</label>
                    <input v-model.number="form.total" type="number" class="input" />
                </div>
            </div>
            <div>
                <label class="label">Category</label>
                <select v-model="form.category" class="input form-select pr-3">
                    <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
                </select>
            </div>
        </AppModal>
    </div>
</template>
