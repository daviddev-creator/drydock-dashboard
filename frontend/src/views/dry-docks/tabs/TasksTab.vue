<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '../../../services/api';
import AppModal from '../../../components/ui/AppModal.vue';

const props = defineProps({ dockId: { type: String, required: true } });

const tasks = ref([]);
const loading = ref(true);
const showAdd = ref(false);
const form = ref({ title: '', responsibility: '', due_date: '', description: '' });

const byStatus = computed(() => {
    const map = { Open: [], 'In Progress': [], Closed: [] };
    for (const t of tasks.value) (map[t.status] ?? map.Open).push(t);
    return map;
});

async function load() {
    loading.value = true;
    try {
        tasks.value = await api.get(`/dry-docks/${props.dockId}/tasks`);
    } finally {
        loading.value = false;
    }
}

async function add() {
    await api.post(`/dry-docks/${props.dockId}/tasks`, form.value);
    showAdd.value = false;
    form.value = { title: '', responsibility: '', due_date: '', description: '' };
    await load();
}

async function setStatus(task, status) {
    await api.put(`/dry-docks/${props.dockId}/tasks/${task.id}`, { status });
    await load();
}

onMounted(load);
</script>

<template>
    <div>
        <div class="mb-3 flex justify-end">
            <button class="btn-primary" @click="showAdd = true">+ Add Task</button>
        </div>
        <div class="grid gap-4 lg:grid-cols-3">
            <section v-for="status in ['Open', 'In Progress', 'Closed']" :key="status">
                <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{{ status }}</h3>
                <div class="space-y-2">
                    <div v-for="task in byStatus[status]" :key="task.id" class="card p-4">
                        <div class="flex items-start justify-between gap-2">
                            <p class="text-sm font-semibold text-slate-800">{{ task.title }}</p>
                            <select
                                class="rounded form-select border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-600"
                                :value="task.status" @change="setStatus(task, $event.target.value)">
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Closed</option>
                            </select>
                        </div>
                        <p class="mt-1 text-xs text-slate-500">
                            Responsibility {{ task.responsibility || '—' }}<template v-if="task.due_date">, Due: {{
                                task.due_date }}</template>
                        </p>
                        <p class="mt-1.5 line-clamp-3 text-xs text-slate-600">{{ task.description }}</p>
                    </div>
                    <p v-if="byStatus[status].length === 0"
                        class="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">
                        Kosong
                    </p>
                </div>
            </section>
        </div>

        <AppModal :open="showAdd" title="Add Task" @close="showAdd = false" @save="add">
            <div>
                <label class="label">Title</label>
                <input v-model="form.title" class="input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="label">Responsibility</label>
                    <input v-model="form.responsibility" class="input" />
                </div>
                <div>
                    <label class="label">Due Date</label>
                    <input v-model="form.due_date" type="date" class="input" />
                </div>
            </div>
            <div>
                <label class="label">Description</label>
                <textarea v-model="form.description" rows="3" class="input" />
            </div>
        </AppModal>
    </div>
</template>
