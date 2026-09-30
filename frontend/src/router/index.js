import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';

const routes = [
    {
        path: '/',
        component: MainLayout,
        children: [
            { path: '', redirect: '/specification-groups' },
            {
                path: 'specification-groups',
                name: 'spec-groups',
                component: () => import('../views/spec-groups/SpecGroupListView.vue'),
                meta: { title: 'Specification Groups' },
            },
            {
                path: 'specification-groups/:id',
                name: 'spec-group-detail',
                component: () => import('../views/spec-groups/SpecGroupDetailView.vue'),
                meta: { title: 'Specification Group' },
            },
            {
                path: 'checklists',
                name: 'checklists',
                component: () => import('../views/checklists/ChecklistListView.vue'),
                meta: { title: 'Checklist' },
            },
            {
                path: 'checklists/:id',
                name: 'checklist-detail',
                component: () => import('../views/checklists/ChecklistDetailView.vue'),
                meta: { title: 'Checklist Detail' },
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.afterEach((to) => {
    document.title = `${to.meta.title ?? 'Dry Dock'} — Dry Dock Management`;
});

export default router;