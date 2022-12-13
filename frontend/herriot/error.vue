<template>

  <div
    class="min-h-screen h-full bg-cover bg-fixed dark:bg-black bg-[url(~/public/images/backgrounds/h.jpg)] dark:bg-[url(~/public/images/backgrounds/background-dark.jpg)]">
    <title>Oops | Herriot</title>
    <n-config-provider :theme="darkTheme">
      <div class="w-4/5 mx-auto bg-glass-600 p-2.5">
        <n-result :status="error.statusCode" title="Error" description="Something is broken 💀">
          <template #footer>
            <div>
              <n-text code>
                {{ error }}
              </n-text>
            </div>
            <a href="/">
              <n-button>Home</n-button>
            </a>
          </template>
        </n-result>
      </div>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui'
const props = defineProps({ error: Object })
</script>