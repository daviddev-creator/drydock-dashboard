<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router';
import {
    LayoutDashboard,
    Layers,
    Wrench,
    ClipboardCheck,
    Anchor,
} from 'lucide-vue-next';

const menus = [
    {
        label: 'Dashboard',
        shortLabel: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Specification Groups',
        shortLabel: 'Spec Groups',
        to: '/specification-groups',
        icon: Layers,
    },
    {
        label: 'Work Order Master',
        shortLabel: 'Work Orders',
        to: '/work-orders',
        icon: Wrench,
    },
    {
        label: 'Checklist',
        shortLabel: 'Checklist',
        to: '/checklists',
        icon: ClipboardCheck,
    },
    {
        label: 'Dry Docks',
        shortLabel: 'Dry Docks',
        to: '/dry-docks',
        icon: Anchor,
    },
];

const route = useRoute();

function isActive(menu) {
    return route.path === menu.to || route.path.startsWith(`${menu.to}/`);
}
</script>

<template>
    <div class="flex min-h-screen flex-col md:flex-row bg-slate-100">
        <header
            class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white shadow-sm md:hidden">
            <div class="flex items-center gap-2">
                <Anchor class="h-6 w-6 text-primary-400" />
                <div>
                    <p class="text-sm font-bold leading-tight">Dry Dock</p>
                    <p class="text-[9px] uppercase tracking-widest text-slate-400">Management</p>
                </div>
            </div>
            <span class="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                Enterprise
            </span>
        </header>

        <aside class="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-300 md:flex min-h-screen">
            <div class="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
                <Anchor class="h-7 w-7 text-primary-500" />
                <div>
                    <p class="text-lg font-bold text-white leading-tight">Dry Dock</p>
                    <p class="text-[11px] uppercase tracking-widest text-slate-500">Management</p>
                </div>
            </div>

            <nav class="mt-4 flex-1 space-y-1.5 px-3">
                <RouterLink v-for="menu in menus" :key="menu.to" :to="menu.to"
                    class="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors"
                    :class="isActive(menu) ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-white'">
                    <component :is="menu.icon" class="h-5 w-5 shrink-0" :stroke-width="1.8" />
                    <span>{{ menu.label }}</span>
                </RouterLink>
            </nav>

            <p class="px-5 py-4 text-[11px] text-slate-500 border-t border-slate-800">
                Express.js · Vue 3 · Tailwind CSS
            </p>
        </aside>

        <main class="flex-1 overflow-x-hidden min-w-0 pb-20 md:pb-6">
            <RouterView />
        </main>

        <nav
            class="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur shadow-lg md:hidden">
            <RouterLink v-for="menu in menus" :key="menu.to" :to="menu.to"
                class="flex flex-1 flex-col items-center justify-center py-1 text-center transition-colors"
                :class="isActive(menu) ? 'text-primary-600 font-semibold' : 'text-slate-500 hover:text-slate-800'">
                <component :is="menu.icon" class="h-5 w-5" :stroke-width="isActive(menu) ? 2.2 : 1.7" />
                <span class="mt-1 text-[10px] leading-tight truncate max-w-[64px]">{{ menu.shortLabel }}</span>
            </RouterLink>
        </nav>
    </div>
</template>