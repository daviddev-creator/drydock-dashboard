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
            {
                path: 'work-orders',
                name: 'work-orders',
                component: () => import('../views/work-orders/WorkOrderListView.vue'),
                meta: { title: 'Work Order Master' },
            },
            {
                path: 'work-orders/:id',
                name: 'work-order-detail',
                component: () => import('../views/work-orders/WorkOrderDetailView.vue'),
                meta: { title: 'Work Order' },
            },
            {
                path: 'dry-docks',
                name: 'dry-docks',
                component: () => import('../views/dry-docks/DryDockListView.vue'),
                meta: { title: 'Dry Docks' },
            },
            {
                path: 'dry-docks/:id',
                name: 'dry-dock-detail',
                component: () => import('../views/dry-docks/DryDockDetailView.vue'),
                meta: { title: 'Dry Dock Detail' },
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