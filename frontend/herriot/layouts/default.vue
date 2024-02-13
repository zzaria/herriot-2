<template>

  <div class="min-h-screen h-full bg-cover bg-fixed dark:bg-black bg-[url(~/public/images/backgrounds/h.jpg)] dark:bg-[url(~/public/images/backgrounds/background-dark.jpg)]">
    <n-config-provider :theme="theme">
      <Navbar />
      <div class="w-full 2xl:w-4/5 mx-auto pt-20">
        <slot />
      </div>
    <n-back-top/>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { darkTheme ,useOsTheme } from 'naive-ui'
const osTheme=useOsTheme();
const theme=computed(()=> osTheme.value=='light'? null: darkTheme);

useHead({
  script: [
    { src: 'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js' },
  ],
  link: [
    { rel: 'stylesheet', type: 'text/css', href:'https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.contextMenu.min.css' },
  ],
  titleTemplate: '%s | Herriot',
});
</script>
<style>
.selected{
  @apply !bg-emerald-600/50 dark:!bg-white/30;
}
</style>
