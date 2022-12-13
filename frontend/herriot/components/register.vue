<script setup lang="ts">
import { Ref } from 'vue';
import * as Constants from '/constants';
const userToken = useCookie("userToken");
const { data: curUser, refresh } = useCurUser();

const username = ref("");
const password = ref("");
const password2 = ref("");
const serverMessage = ref("");

const message = computed(() => {
    let errors = [serverMessage.value];
    if (password.value != password2.value) {
        errors.push("Passwords don't match");
    }
    return errors.join("<br>");
});
const register = async () => {
    if (password.value != password2.value) {
        return;
    }
    const info = { username: username.value, password: password.value };
    const { data } = await useFetch<Record<string,string>>(Constants.BACKEND + '/api/user/', { method: 'POST', params: info, initialCache: false });
    const error = data.value.error;
    if (error) {
        serverMessage.value = error;
    }
    else {
        userToken.value = data.value.token;
        window.location.href = "/";
    }
}
</script>

<template>
    <div>
        <n-space vertical>
            <n-space>
                <n-input placeholder="Username" v-model:value="username" required maxlength="50" show-count clearable
                    autosize class="min-w-[10rem]" />
                <n-input type="password" placeholder="Password" v-model:value="password" required maxlength="256"
                    show-count show-password-on="click" />
                <n-input type="password" placeholder="Password Confirmation" v-model:value="password2" required
                    show-password-on="click" />
            </n-space>
            <n-text v-html="message" :type="message == 'Success' ? 'success' : 'error'"></n-text>
            <n-button tertiary type="info" @click="register">Register</n-button>
        </n-space>
    </div>
</template>