<script setup lang="ts">
import { Ref } from 'vue';
import * as Constants from '/constants';
const userToken = useCookie("userToken", { maxAge: 16777216 });
const { data: curUser, refresh } = useCurUser();
const username = ref("");
const password = ref("");
const message = ref("");
const login = async () => {
    const info = { username: username.value, password: password.value };
    const { data }: { data: Ref } = await useFetch(Constants.BACKEND + '/api/account/login', { method: 'POST', params: info, initialCache: false });
    const message2 = data.value.message;
    message.value = message2;
    if (message2 == "Success") {
        userToken.value = data.value.token;
        window.location.href = "/";
    }
}
</script>
<template>
    <div>
        <n-space vertical>
            <n-space>
                <n-input round placeholder="Username" v-model:value="username" required />
                <n-input round type="password" placeholder="Password" v-model:value="password" required
                    show-password-on="click" />
            </n-space>
            <n-text v-html="message" :type="message == 'Success' ? 'success' : 'error'"></n-text>
            <n-button @click="login">Login</n-button>
        </n-space>
    </div>
</template>