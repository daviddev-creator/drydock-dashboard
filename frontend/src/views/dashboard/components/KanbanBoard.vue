<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { api } from '../../../services/api';
import AppModal from '../../../components/ui/AppModal.vue';

const props = defineProps({
    title: { type: String, required: true },
    board: { type: String, required: true }, 
});

const columns = ref([]);
const loading = ref(true);
const saving = ref(false);

const dragging = ref(null);
const dragOverColumn = ref(null);
const editing = ref(null);
const showEdit = ref(false);

function thumbColor(title) {
    const colors = ['bg-sky-500', 'bg-teal-500', 'bg-indigo-500', 'bg-cyan-600', 'bg-blue-500', 'bg-slate-500'];
    let hash = 0;
    for (const ch of String(title)) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
    return colors[hash % colors.length];
}

async function load() {
    const data = await api.get(`/kanban/${props.board}`);
    columns.value = data.columns;
    for (const col of columns.value) {
        if (!slotForms.value[col.id]) slotForms.value[col.id] = { title: '', description: '' };
    }
    loading.value = false;
}

const slotForms = ref({});
const slotRefs = ref({});

function slotForm(column) {
    if (!slotForms.value[column.id]) slotForms.value[column.id] = { title: '', description: '' };
    return slotForms.value[column.id];
}

async function submitSlot(column) {
    const form = slotForm(column);
    const title = form.title.trim();
    if (!title) return;
    await api.post('/kanban', {
        board: props.board,
        column_id: column.id,
        title,
        description: form.description.trim(),
    });
    form.title = '';
    form.description = '';
    await load();
}

function focusSlot(column) {
    nextTick(() => slotRefs.value[column.id]?.focus());
}

function onDragStart(event, card) {
    dragging.value = card;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(card.id));
}

async function onDrop(column) {
    const card = dragging.value;
    dragOverColumn.value = null;
    dragging.value = null;
    if (!card) return;
    const sourceColumn = columns.value.find((c) => c.cards.some((k) => k.id === card.id));
    if (!sourceColumn || sourceColumn.id === column.id) return;
    await api.put(`/kanban/${card.id}`, { column_id: column.id });
    await load();
}

function openEdit(card) {
    editing.value = { ...card };
    showEdit.value = true;
}

async function saveEdit() {
    saving.value = true;
    try {
        await api.put(`/kanban/${editing.value.id}`, {
        title: editing.value.title,
        description: editing.value.description,
        });
        showEdit.value = false;
        await load();
    } finally { saving.value = false; }
}

async function removeCard() {
    if (!confirm(`Hapus kartu "${editing.value.title}"?`)) return;
    await api.del(`/kanban/${editing.value.id}`);
    showEdit.value = false;
    await load();
}

onMounted(load);
</script>

<template>
    <section>
        <h2 class="mb-3 text-lg font-semibold text-slate-800">{{ title }}</h2>

        <div v-if="loading" class="rounded-xl bg-white/60 px-4 py-8 text-center text-sm text-slate-400">
            Memuat papan…
        </div>

        <div v-else class="flex gap-4 overflow-x-auto pb-2">
            <div v-for="column in columns" :key="column.id"
                class="flex w-72 flex-shrink-0 flex-col rounded-xl bg-white p-3 shadow-sm transition-colors"
                :class="dragOverColumn === column.id ? 'bg-primary-50 ring-2 ring-primary-400' : ''"
                @dragover.prevent="dragOverColumn = column.id"
                @dragleave="dragOverColumn !== column.id || (dragOverColumn = null)" @drop.prevent="onDrop(column)">
                <!-- Header kolom: nama + tombol + -->
                <div class="mb-2.5 flex items-center justify-between px-1">
                    <div class="min-w-0">
                        <h3 class="truncate text-xs font-bold uppercase tracking-wide text-slate-600">{{ column.label }}
                        </h3>
                        <p v-if="column.vessel_name" class="truncate text-[11px] text-slate-400">{{ column.vessel_name
                            }}</p>
                    </div>
                    <button class="text-lg leading-none text-slate-400 transition-colors hover:text-primary-600"
                        title="Tambah kartu" @click="focusSlot(column)">
                        +
                    </button>
                </div>

                <div v-for="card in column.cards" :key="card.id" draggable="true"
                    class="mb-2.5 cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
                    @dragstart="onDragStart($event, card)" @dragend="dragging = null" @click="openEdit(card)">
                    <div class="flex items-start gap-2.5">
                        <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-white"
                            :class="thumbColor(card.title)">
                            ⚓
                        </span>
                        <div class="min-w-0">
                            <p class="truncate text-sm font-semibold text-slate-800">{{ card.title }}</p>
                            <p v-if="card.description" class="text-xs text-slate-500">{{ card.description }}</p>
                        </div>
                    </div>
                </div>

                <div class="rounded-lg border border-dashed border-slate-200 bg-white p-2.5">
                    <input :ref="(el) => (slotRefs[column.id] = el)" v-model="slotForm(column).title"
                        class="input mb-1.5 !py-1.5 text-sm" placeholder="Title…" @keydown.enter="submitSlot(column)" />
                    <textarea v-model="slotForm(column).description" class="input !py-1.5 text-sm" rows="2"
                        placeholder="Description…" @keydown.enter.exact.prevent="submitSlot(column)" />
                </div>
            </div>
        </div>

        <AppModal :open="showEdit" title="Edit kartu" :saving="saving" @close="showEdit = false" @save="saveEdit">
            <div>
                <label class="label">Title</label>
                <input v-model="editing.title" class="input" />
            </div>
            <div>
                <label class="label">Description</label>
                <textarea v-model="editing.description" rows="3" class="input" />
            </div>
            <div class="flex justify-end">
                <button class="btn-danger !py-1 text-xs" @click="removeCard">Hapus kartu</button>
            </div>
        </AppModal>
    </section>
</template>
