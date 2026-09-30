<script setup>
/** Badge berwarna otomatis berdasarkan teks status. */
const props = defineProps({
    status: { type: String, required: true },
});

const colors = {
    Open: 'bg-sky-100 text-sky-700',
    'In Progress': 'bg-amber-100 text-amber-700',
    'On Hold': 'bg-orange-100 text-orange-700',
    Complete: 'bg-emerald-100 text-emerald-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Closed: 'bg-slate-200 text-slate-600',
    Planning: 'bg-indigo-100 text-indigo-700',
    Execution: 'bg-amber-100 text-amber-700',
    Pending: 'bg-amber-100 text-amber-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-red-100 text-red-700',
    Received: 'bg-emerald-100 text-emerald-700',
    'Sent, Awaiting Quotation': 'bg-amber-100 text-amber-700',
    'Not Sent': 'bg-slate-200 text-slate-600',
    'In Quotation (Quotation No.)': 'bg-sky-100 text-sky-700',
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-slate-200 text-slate-600',
};
</script>

<template>
    <span
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
        :class="colors[status] ?? 'bg-slate-200 text-slate-600'"
    >
        {{ status }}
    </span>
</template>
