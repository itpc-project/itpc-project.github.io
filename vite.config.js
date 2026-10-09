import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'projects.html'),
        projectActivities: resolve(__dirname, 'project-activities.html'),
        activityForm: resolve(__dirname, 'activity-form.html'),
        userManagement: resolve(__dirname, 'user-management.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: false,
    host: true,
  },
});