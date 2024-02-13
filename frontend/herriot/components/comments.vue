<script setup lang="ts">
import * as Constants from '/constants';
const userToken = useCookie("userToken");
let { data: curUser } = await useCurUser();
if (!curUser.value) {
    curUser.value = {};
}
const props = defineProps({
    comments: { default: []},
    parent: { default: null ,type:String},
    problem: {},
    noChildren: { default: false, type:Boolean},
    postId: { default: null },
});

const title = ref("");
const content = ref("");
const reply = ref(false);
const edit = ref(null);
const shownComments = computed(() => {
    return props.comments.filter(comment => comment.problem == props.problem && comment.parent == props.parent && (!props.postId || props.postId==comment._id));
});

const newPost = async () => {
    await useFetch(Constants.BACKEND + "/api/post/", {
        method: "POST",
        initialCache: false,
        headers: { usertoken: userToken.value },
        params: { title: title.value, content: content.value, problem: props.problem, parent: props.parent }
    });
    location.reload();
};
const editPost = async (post) => {
    props.comments.forEach(element => {
        if (element._id == post) {
            element.content = content.value;
            element.title = title.value;
        }
    });
    await useFetch(Constants.BACKEND + "/api/post/" + post, {
        method: "PUT",
        initialCache: false,
        headers: { usertoken: userToken.value },
        params: { title: title.value, content: content.value }
    });
};
const vote = async (post, val) => {
    await useFetch(Constants.BACKEND + "/api/vote/", {
        method: "POST",
        initialCache: false,
        headers: { usertoken: userToken.value },
        params: { type: 0, parent: post, value: val }
    });
    location.reload();
};
const beginEdit = (id) => {
    edit.value = id;
    reply.value = false;
    props.comments.forEach(element => {
        if (element._id == id) {
            content.value = element.content;
            title.value = element.title;
        }
    });
}
</script>

<template>
    <div class="">
        <n-button ghost round type="primary" @click="reply=!reply;content=title=edit=null"
            v-if="userToken && (!noChildren || curUser.perms > Constants.ADMIN_PERM) && !postId">Comment
        </n-button>
        <n-card v-if="reply">
            <n-space vertical>
                <n-input v-model:value="title" />
                <n-input type="textarea" v-model:value="content" />
                <n-button @click="newPost">Submit</n-button>
            </n-space>
        </n-card>
        <template v-for="comment in shownComments">
            <n-card :title="comment.title" :bordered="false" :segmented="{ footer: 'soft' }" footer-style="padding:0"
                content-style="padding-bottom: 0">
                <n-page-header :subtitle="Constants.prettyDate(comment.createdAt)">
                    <template #avatar>
                        <n-avatar size="small" :src="comment.author.profilePic" />
                    </template>
                    <template #title>
                        <NuxtLink :to="'/user/' + comment.author._id">
                            <RatedText :rating="comment.author.power" :special="comment.author.username == 'oyster'"
                                size="15">{{ comment.author.username }}</RatedText>
                        </NuxtLink>
                    </template>
                    <template #extra>

                        <n-button dashed
                            v-if="comment.author._id == curUser._id || curUser.perms >= Constants.ADMIN_PERM"
                            @click="() => beginEdit(comment._id)">Edit</n-button>


                        <NuxtLink :to="`/problem/${problem}/${comment._id}`">
                            <n-button quaternary type="info" circle>#</n-button>
                        </NuxtLink>
                    </template>
                </n-page-header>
                <span v-html="Constants.formatText(comment.content)" />

                <div>
                    {{ comment.score }} Likes
                    <span v-if="userToken">
                        <n-divider vertical />
                        <n-button text @click="() => vote(comment._id, 1)">Like</n-button>
                        <n-divider vertical />
                        <n-button text @click="() => vote(comment._id, 0)">Reset</n-button>
                        <n-divider vertical />
                        <n-button text @click="() => vote(comment._id, -1)">Dislike</n-button>
                    </span>
                </div>

                <n-card v-if="edit == comment._id">
                    <n-space vertical>
                        <n-input v-model:value="title" />
                        <n-input type="textarea" v-model:value="content" />
                        <n-button @click="() => editPost(comment._id)">Done</n-button>
                    </n-space>
                </n-card>

                <template #footer>
                    <comments v-if="shownComments&&shownComments.length && !noChildren" :problem="problem" :comments="comments"
                        :parent="comment._id">
                    </comments>
                </template>
            </n-card>
            <n-divider />
        </template>
    </div>
</template>
