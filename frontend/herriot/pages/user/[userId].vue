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

const currentStep = ref(1);
const currentStatus=ref("");
const codeforceAccount=ref("");
const codeforceMessage=ref("");
const verifyCodeforce=async ()=>{
  currentStatus.value="wait";
  const {error}=await useFetch(Constants.BACKEND + '/api/user/codeforces', { method: 'POST', initialCache: false, headers: { usertoken: userToken.value },query:{account:codeforceAccount.value}});
  if(error.value){
    currentStatus.value="error";
  }
  else{
    currentStatus.value="process";
    currentStep.value++;
  }
}

const formatLargeNumber= x => x<1000000? Math.round(x):x.toExponential(2);
  
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
                  {{formatLargeNumber(user.experience)}}
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Progress">
                  {{formatLargeNumber(Constants.EXP_TO_LEVEL(user.experience).progress)}}
                  <template #suffix>
                    /
                    {{formatLargeNumber(Constants.EXP_TO_LEVEL(user.experience).required)}}
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
                <n-input-group-label>Name</n-input-group-label>
                <n-input v-model:value="user.username" maxlength="50" show-count></n-input>
              </n-input-group>
              <n-input-group>
                <n-input-group-label>Old Password</n-input-group-label>
                <n-input v-model:value="oldPassword" type="password"></n-input>
              </n-input-group>
              <n-input-group>
                <n-input-group-label>Picture</n-input-group-label>
                <n-input v-model:value="user.profilePic" clearable></n-input>
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
            <n-space>
              <n-button type="info" @click="updateUser">Update</n-button>
              <n-button type="error" @click="logOut">Log Out</n-button>
            </n-space>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="oanfwcyeiu" tab="Link accounts" v-if="user.solved_tag">
          <n-space vertical>
            <n-breadcrumb>
              <n-breadcrumb-item>
                <NuxtLink to="/user">Users</NuxtLink>
              </n-breadcrumb-item>
              <n-breadcrumb-item v-if="!loading">{{ user.username }}</n-breadcrumb-item>
              <n-breadcrumb-item>Link Accounts</n-breadcrumb-item>
            </n-breadcrumb>

            <n-thing>
              <template #avatar>
                <n-avatar>
                  CF
                </n-avatar>
              </template>
              <template #header>
                Codeforces
              </template>
              <template #header-extra>
                <NuxtLink to="https://codeforces.com/" target="_blank">
                  <n-button circle size="small">
                    <template #icon>
                      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5"></path><path d="M10 14L20 4"></path><path d="M15 4h5v5"></path></g></svg>
                    </template>
                  </n-button>
                </NuxtLink>
              </template>
              <template #description>
                https://codeforces.com/
              </template>
              Link your Codeforce account to get permissions for adding and editing problems and public tags.
              <template #footer>
                You need at least 1900 rating.
              </template>
              <template #action>
                <NuxtLink to="https://codeforces.com/settings/social" target="_blank">
                  <n-button size="small">
                    Go to Codeforces
                  </n-button>
                </NuxtLink>
              </template>
            </n-thing>

            <n-steps :current="currentStep" :status="currentStatus">
              <n-step title="Set Name">
                Change your first name (english) to <n-text code>herriot_{{ user._id }}</n-text> on Codeforce.
                <n-button size="small" @click="currentStep++" :disabled="currentStep!=1" type="primary" >Done</n-button>
              </n-step>
              <n-step title="Enter Account">
                Enter your codeforces account
                <n-input v-model:value="codeforceAccount" :disabled="currentStep!=2"></n-input>
                <n-space justify="space-between">
                  <n-button size="tiny" @click="currentStep--;" :disabled="currentStep!=2" quaternary type="warning">Prev</n-button>
                  <n-button size="tiny" @click="currentStep++;" :disabled="currentStep!=2" quaternary>Next</n-button>
                </n-space>
              </n-step>
              <n-step title="Verify">
                <n-space  justify="end">
                  <n-button size="large" @click="verifyCodeforce" :disabled="currentStep!=3" type="primary">Check</n-button>
                  <n-button @click="currentStep--; currentStatus='process'" :disabled="currentStep!=3" secondary type="warning" size="tiny" round>Go back</n-button>
                </n-space>
              </n-step>
              <n-step title="Done" description="Your account has been updated" />
            </n-steps>
          </n-space>
        </n-tab-pane>
        <n-tab-pane name="lull" tab="Blank">
        </n-tab-pane>
      </n-tabs>
    </no-ssr>
  </div>

</template>
