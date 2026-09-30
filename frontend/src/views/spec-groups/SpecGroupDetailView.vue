<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '../../services/api';
import PageHeader from '../../components/ui/PageHeader.vue';
import DetailField from '../../components/ui/DetailField.vue';
import EmptyState from '../../components/ui/EmptyState.vue';

const route = useRoute();
const router = useRouter();
const group = ref(null);
const loading = ref(true);

onMounted(async () => {
    try {
        group.value = await api.get(`/specification-groups/${route.params.id}`);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="p-6">
        <button class="btn-secondary mb-4" @click="router.back()">← Back</button>

        <EmptyState v-if="loading" loading />
        <template v-else-if="group">
            <PageHeader :title="group.name" :subtitle="`Group ${group.group_no}`" />

            <div class="card max-w-xl space-y-4 p-5">
                <DetailField label="Name" :value="group.name" />
                <DetailField label="Vessel" :value="group.vessel_name" />
                <DetailField label="Group No." :value="group.group_no" />
                <DetailField label="Sort Order" :value="group.sort_order" />
                <div>
                    <p class="label">Frontpage</p>
                    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        :class="group.frontpage ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'">
                        {{ group.frontpage ? 'Yes' : 'No' }}
                    </span>
                </div>
            </div>
        </template>
    </div>
</template>
