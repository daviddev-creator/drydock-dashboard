<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router';

const menus = [
    { label: 'Dashboard', to: '/dashboard', icon: '' },
    { label: 'Specification Groups', to: '/specification-groups', icon: '' },
    { label: 'Work Order Master', to: '/work-orders', icon: '' },
    { label: 'Checklist', to: '/checklists', icon: '' },
    { label: 'Dry Docks', to: '/dry-docks', icon: '' },
];

const route = useRoute();

function isActive(menu) {
    return route.path === menu.to || route.path.startsWith(`${menu.to}/`);
}
</script>

<template>
    <div class="flex min-h-screen">
        <aside class="flex w-64 flex-col bg-slate-900 text-slate-300">
            <div class="flex items-center gap-2 px-5 py-5">
                <div>
                    <p class="text-lg font-bold text-white leading-tight">Dry Dock</p>
                    <p class="text-[11px] uppercase tracking-widest text-slate-500">Management</p>
                </div>
            </div>
            <nav class="mt-2 flex-1 space-y-1 px-3">
                <RouterLink
                v-for="menu in menus"
                :key="menu.to"
                :to="menu.to"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                :class="isActive(menu) ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'"
                >
                <span class="text-base">{{ menu.icon }}</span>
                {{ menu.label }}
                </RouterLink>
            </nav>
            <p class="px-5 py-4 text-[11px] text-slate-600">
                Express.js · Vue 3 · Tailwind CSS
            </p>
        </aside>

        <main class="flex-1 overflow-x-hidden">
            <RouterView />
        </main>
    </div>
</template>
