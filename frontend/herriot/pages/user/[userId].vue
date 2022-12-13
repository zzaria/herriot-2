<script setup>
import * as Constants from '/constants';
const route = useRoute();
const userId = route.params.userId;
const userToken = useCookie("userToken");
let { data: user, refresh } = await useFetch(Constants.BACKEND + '/api/user/' + userId, { method: 'GET', headers: { usertoken: userToken.value } });
const placeholder = ['password', 'confirm'];
const { data: curUser } = useCurUser();
const oldPassword = ref("");
const newPassword = ref(['', '']);
const message = ref("");
const userTags = computed(() => {
  return user.value.tags.filter(tag => tag.access == 0).map(tag => tag.tag).filter(tag => tag.public).map(tag => {
    if (!tag.thumbnail) {
      tag.thumbnail = Constants.RANDOM_THUMBNAIL(tag._id);
    }
    return tag;
  });
});
const passwordConfirm = computed(() => {
  return newPassword.value[0] == newPassword.value[1] ? "success" : "error";
});

const updateUser = async () => {
  if (newPassword.value[0] != newPassword.value[1]) {
    message.value = "Passwords don't match";
    return;
  }
  user.value.password = newPassword.value[0];
  let { data } = await useFetch(Constants.BACKEND + '/api/user/' + userId, { method: 'PUT', initialCache: false, headers: { usertoken: userToken.value }, body: { password: oldPassword.value, newUser: user.value } });
  if (data.value.error) {
    message.value = data.value.error;
  }
  else {
    message.value = "Success";
    refresh();
  }
};
const logOut = async () => {
  userToken.value = null;
  window.location = '/login';
};

const loading = ref(false);
onMounted(async () => {
  loading.value = true;
  await refresh();
  loading.value = false;
});
</script>

<template>
  <div class="bg-frostedglass-900 dark:bg-glass-900  p-2.5 ">
    <Title>{{ user.username }}</Title>
    <no-ssr>
      <n-tabs type="line" animated>
        <n-tab-pane name="oasis" tab="Profile">
          <n-page-header :subtitle="user.description">
            <template #header>
              <n-breadcrumb>
                <n-breadcrumb-item>
                  <NuxtLink to="/user">Users</NuxtLink>
                </n-breadcrumb-item>
                <n-breadcrumb-item v-if="!loading">{{ user.username }}</n-breadcrumb-item>
                <n-breadcrumb-item>Profile</n-breadcrumb-item>
              </n-breadcrumb>
            </template>
            <template #avatar>
              <n-skeleton v-if="loading" circle size="medium" />
              <n-avatar :src="user.profilePic" v-if="!loading" />
            </template>
            <template #title>
              <n-skeleton v-if="loading" :sharp="false" size="small" width="50px" />
              <div v-if="!loading">
                {{ user.username }}
              </div>
            </template>
            <template #extra v-if="!loading">
              {{ user.perms }}*
            </template>
            <n-skeleton v-if="loading" :sharp="false" size="large" />
            <n-grid :cols="6" v-if="!loading">
              <n-gi>
                <n-statistic label="Power">
                  <RatedText :rating="user.power" size="25" :special="user.username == 'oyster'">
                    <n-number-animation show-separator from="0" :to="user.power" />
                  </RatedText>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Level" :value="Constants.EXP_TO_LEVEL(user.experience).level" />
              </n-gi>
              <n-gi>
                <n-statistic label="Experience">
                  <n-number-animation show-separator :from="0" :to="user.experience" :active="true" />
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Progress">
                  <n-number-animation show-separator :from="0" :to="Constants.EXP_TO_LEVEL(user.experience).progress"
                    :active="true" />
                  <template #suffix>
                    /
                    <n-number-animation show-separator :from="0" :to="Constants.EXP_TO_LEVEL(user.experience).required"
                      :active="true" />
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Solved Count" :value="user.solved" />
              </n-gi>
              <n-gi>
                <n-statistic label="Collections" :value="userTags.length" />
              </n-gi>
            </n-grid>
            <template #footer>
              <n-skeleton v-if="loading" width="50px" />
              <span v-if="!loading">Joined {{ user.createdAt }}</span>
            </template>
          </n-page-header>
          <n-divider></n-divider>
          <n-skeleton v-if="loading" round size="large" />
          <div v-if="!loading">
            <n-image :src="user.profilePic" class="float-right h-36 w-36" />
            <n-progress type="line" status="success"
              :percentage="Math.round(Constants.EXP_TO_LEVEL(user.experience).progress / Constants.EXP_TO_LEVEL(user.experience).required * 10000) / 100"
              :indicator-placement="'inside'" processing></n-progress>
            <h1 class="text-7xl font-light">{{ user.username }}</h1>
          </div>
          <n-divider></n-divider>
          <n-spin :show="loading" description="Loading">
            <div v-if="userTags.length > 0">
              <n-space justify="center">
                <n-h1>
                  <n-text type="primary">{{ user.username }}'s Collections</n-text>
                </n-h1>
              </n-space>
              <div class="grid grid-cols-2 md:grid-cols-7 gap-4">
                <div v-for="tag in userTags">
                  <NuxtLink :to="`/tag/${tag._id}`">
                    <n-card :title="tag.name" hoverable>
                      <template #cover>
                        <img :src="tag.thumbnail">
                      </template>
                      <template #header>
                        <n-ellipsis line-clamp="1">{{ tag.name }}</n-ellipsis>
                      </template>
                    </n-card>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </n-spin>
        </n-tab-pane>
        <n-tab-pane name="" tab="None">
        </n-tab-pane>
        <n-tab-pane name="Edit" tab="Edit" v-if="user.solved_tag">
          <n-space vertical>
            <n-breadcrumb>
              <n-breadcrumb-item>
                <NuxtLink to="/user">Users</NuxtLink>
              </n-breadcrumb-item>
              <n-breadcrumb-item v-if="!loading">{{ user.username }}</n-breadcrumb-item>
              <n-breadcrumb-item>Edit</n-breadcrumb-item>
            </n-breadcrumb>

            <n-alert v-if="message" :type="message == 'Success' ? 'success' : 'error'"
              :title="message == 'Success' ? 'Changes Applied' : 'Error'" closable>
              {{ message }}
            </n-alert>

            <n-space>
              <n-input-group>
                <n-input-group-label>Picture</n-input-group-label>
                <n-input v-model:value="user.profilePic"></n-input>
              </n-input-group>
              <n-input-group>
                <n-input-group-label>Name</n-input-group-label>
                <n-input v-model:value="user.username" maxlength="50" show-count></n-input>
              </n-input-group>
              <n-input-group>
                <n-input-group-label>Old Password</n-input-group-label>
                <n-input v-model:value="oldPassword" type="password"></n-input>
              </n-input-group>
            </n-space>
            <n-input-group>
              <n-input-group-label>New Password</n-input-group-label>
              <n-input v-model:value="newPassword" pair separator="-" type="password" :placeholder="placeholder"
                :status="passwordConfirm"></n-input>
            </n-input-group>
            <n-input type="textarea" placeholder="description" v-model:value="user.description" maxlength="1000"
              show-count autosize></n-input>
            <n-input-group v-if="curUser.perms >= Constants.ADMIN_PERM">
              <n-input-group-label>Permissions</n-input-group-label>
              <n-input v-model:value="user.perms"></n-input>
            </n-input-group>

            <n-text :type="message == 'Success' ? 'success' : 'error'">
              {{ message }}
            </n-text>
            <n-button type="info" @click="updateUser">Update</n-button>
            <n-button type="error" @click="logOut">Log Out</n-button>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </no-ssr>
  </div>

</template>
