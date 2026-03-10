<template>
    <h1>404 - Not Found</h1>
    <button @click="goBackToChat">Go back to Chat</button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBackToChat = () => {
  router.push({ name: 'chat' })
}

</script>
