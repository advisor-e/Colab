<template lang="pug">
  audit-viewer(endpoint="/api/people/audit/preview" :preview="true")
</template>

<script>
/**
 * Audit log — SHOW-HOME PREVIEW of the admin/compliance viewer (FEAT-AUDIT-UI).
 * Points at the dev-only /preview endpoint so it can be demonstrated without a real
 * super-admin login. In production the viewer reads /api/people/audit, which is
 * server-gated to the platform super-admin (Mentor tier). Reached from the Mentor
 * console; no production nav link (dev preview).
 */
import AuditViewer from '~/components/shared/AuditViewer.vue'

export default {
  name: 'AuditLogPage',
  components: { AuditViewer }
}
</script>
