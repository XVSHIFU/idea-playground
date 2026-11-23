<script setup lang="ts">
withDefaults(defineProps<{size?:number}>(),{size:20})
</script>
<template><svg :width="size" :height="size" viewBox="0 0 32 32" fill="none" aria-hidden="true" class="entropy-icon"><path d="m14 13-12 1 8 8 6-3 1 12 6-10-3-5 10-10-13 3Z" fill="#62dce9"/><path d="m3 14 9 1-2 7ZM18 21l-1 10 6-10ZM21 12l9-6-7 12Z" fill="#4aa3ce"/><path d="m12 7 9 1 5 8-6 9-10-3-5-8Z" fill="#d79ce7"/><path d="m12 7 9 1-4 7-12-1Z" fill="#f4d1f4"/><path d="m17 15 9 1-6 9-3-6Z" fill="#a670d4"/><path d="m5 14 12 1 3 10-10-3Z" fill="#c78bdd"/></svg></template>
