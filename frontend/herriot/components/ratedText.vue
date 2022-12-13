<script setup lang="ts">
const props = defineProps({
    rating: Number,
    special: { default: false, type: Boolean },
    size: {},
});
const color = computed(() => {
    let rating = props.rating;
    if (rating == -1000)
        rating = null;
    if (rating < 0) {
        return '#78350f';
    }
    else if (rating < 1200) {
        return '#95a5a6';
    }
    else if (rating < 1400) {
        return '#2ecc71';
    }
    else if (rating < 1600) {
        return '#16e0e0';
    }
    else if (rating < 1900) {
        return '#6f66ff';
    }
    else if (rating < 2100) {
        return '#9b59b6';
    }
    else if (rating < 2400) {
        return '#ffb100';
    }
    else if (rating < 2700) {
        return 'red';
    }
    else if (rating < 3000) {
        return '#cbfdfd';
    }
    else if (rating < 3300) {
        return '#cbfdfd';
    }
    else if (rating < 3600) {
        return 'red';
    }
    else if (rating < 4000) {
        return '#a05fff';
    }
    return '';
});
const style = computed(() => {
    if (props.special) {
        return 'color:magenta;';
    }
    let rating = props.rating;
    if (!rating) {
        return null;
    }
    if (rating < 3000 && rating > 1900 && progress.value >= 0.5) {
        return `color: ${color.value}; text-shadow:0 0 2px ${color.value}, 0 0 4px ${color.value};`;
    }
    else if (rating < 3000) {
        return `color: ${color.value};`;
    }
    else if (rating < 4000) {
        return `color:black; text-shadow:0 0 2px ${color.value},0 0 3px ${color.value},0 0 5px ${color.value}; font-weight:bold;`
    }
    else if (rating < 5000) {
        return `color:white; text-shadow:0 0 4px white; font-weight:bold;`;
    }
    else {
        return `color:white; text-shadow:0 0 2px white,0 0 3px white,0 0 5px white; font-weight:bold;`;
    }
});
const progress = computed(() => {
    let rating = props.rating;
    if (rating < 0) {
        return (rating + 1000) / 1000;
    }
    else if (rating < 1200) {
        return (rating) / 1200;
    }
    else if (rating < 1400) {
        return (rating - 1200) / 200;
    }
    else if (rating < 1600) {
        return (rating - 1400) / 200;
    }
    else if (rating < 1900) {
        return (rating - 1600) / 300;
    }
    else if (rating < 2100) {
        return (rating - 1900) / 200;
    }
    else if (rating < 2400) {
        return (rating - 2100) / 300;
    }
    else if (rating < 2700) {
        return (rating - 2400) / 300;
    }
    else {
        return (rating - 2700) / 300;
    }
});
const image = computed(() => {
    if (props.special) {
        return "/images/rating_circle/diamond.png";
    }
    let rating = props.rating;
    if (rating < 3600) {
        return `/images/rating_circle/${Math.floor(rating / 100) * 100}.png`;
    }
    else if (rating < 4000) {
        return "/images/rating_circle/4000.png";
    }
    else {
        return "/images/rating_circle/5000.png";
    }
});
const defaultText = computed(() => {
    return props.rating && props.rating != -1000 || props.rating === 0 ? Math.round(props.rating) : "Unrated";
});
</script>

<template>
    <span :style="style + `font-size: ${size}px;`" class="drop-shadow-[1px_1px_rgba(0,0,0,0.4)] dark:drop-shadow-none">
        <img v-if="rating >= 3000 || special" :src=image
            :style="`height:${size}px; display:inline-block; margin-right: 0.25rem;`">
        <span v-else-if="rating !== null"
            :style="`margin-right: 0.25rem; display:inline-block; width: ${size}px; height: ${size}px;
            border-radius: 50%; border: 1px solid; border-color: ${color};
            background: rgba(0, 0, 0, 0) linear-gradient(to top, ${color} ${progress * 100}%, rgba(0, 0, 0, 0) ${progress * 100}%) repeat scroll 0% 0% border-box;`"></span>
        <slot>{{ defaultText }}</slot>
    </span>
</template>