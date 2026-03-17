<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { io } from 'socket.io-client'
import { buildBackendUrl } from '../config/backend'
import { logout, useAuth } from '../composables/useAuth'

const router = useRouter()
const { token, user } = useAuth()

const draft = ref('')
const errorMessage = ref('')
const connectionLabel = ref('Conectando...')
const messages = ref([])
const participants = ref([])
const messagesContainer = ref(null)

const messageCount = computed(() => messages.value.length)
const isConnected = computed(() => connectionLabel.value === 'Conectado')

let socket

function formatTime(value) {
  if (!value) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())
  }

  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) {
    return value
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())
  }

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function resolveDisplayName(candidate) {
  if (!candidate) {
    return 'Sistema'
  }

  if (typeof candidate === 'string') {
    return candidate
  }

  return candidate.name ?? candidate.email ?? candidate.username ?? 'Sistema'
}

function isOwnMessage(message, authorName) {
  const currentUser = user.value

  if (!currentUser) {
    return false
  }

  const knownNames = [currentUser.name, currentUser.email].filter(Boolean)

  return (
    message?.own === true ||
    message?.isOwn === true ||
    knownNames.includes(authorName) ||
    knownNames.includes(resolveDisplayName(message?.user)) ||
    knownNames.includes(resolveDisplayName(message?.author))
  )
}

function normalizeMessage(message, index = 0) {
  if (typeof message === 'string') {
    return {
      id: `message-${Date.now()}-${index}`,
      author: 'Sistema',
      body: message,
      time: formatTime(),
      own: false,
    }
  }

  const authorName = resolveDisplayName(
    message?.user ??
      message?.author ??
      message?.sender ??
      message?.username ??
      message?.email,
  )

  return {
    id: message?.id ?? message?._id ?? `message-${Date.now()}-${index}`,
    author: authorName,
    body: message?.text ?? message?.body ?? message?.message ?? '',
    time: formatTime(message?.createdAt ?? message?.timestamp ?? message?.time),
    own: isOwnMessage(message, authorName),
  }
}

function normalizeUsers(payload) {
  const users = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.users)
      ? payload.users
      : []

  return users.map((entry, index) => ({
    id: entry?.id ?? entry?._id ?? entry?.email ?? entry?.name ?? `user-${index}`,
    name: resolveDisplayName(entry),
  }))
}

async function scrollMessagesToBottom() {
  await nextTick()

  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = undefined
  }
}

function redirectToLogin() {
  logout()
  router.push({ name: 'login' })
}

function signOut() {
  disconnectSocket()
  redirectToLogin()
}

function sendMessage() {
  const text = draft.value.trim()

  if (!text || !socket) {
    return
  }

  socket.emit('chat:message:send', { text })
  draft.value = ''
}

watch(
  messages,
  () => {
    scrollMessagesToBottom()
  },
  { deep: true },
)

onMounted(() => {
  if (!token.value) {
    redirectToLogin()
    return
  }

  socket = io(buildBackendUrl(), {
    auth: {
      token: token.value,
    },
  })

  socket.on('connect', () => {
    connectionLabel.value = 'Conectado'
    errorMessage.value = ''
  })

  socket.on('disconnect', () => {
    connectionLabel.value = 'Desconectado'
  })

  socket.on('connect_error', (error) => {
    connectionLabel.value = 'Falha na conexao'
    errorMessage.value = error.message || 'Nao foi possivel conectar ao chat.'
  })

  socket.on('chat:history', (payload) => {
    const history = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.messages)
        ? payload.messages
        : []

    messages.value = history.map((message, index) => normalizeMessage(message, index))
  })

  socket.on('chat:users', (payload) => {    
    participants.value = normalizeUsers(payload)
  })

  socket.on('chat:message', (payload) => {
    messages.value.push(normalizeMessage(payload, messages.value.length))
  })

})

onBeforeUnmount(() => {
  disconnectSocket()
})
</script>

<template>
  <main class="chat-page">
    <section class="chat-shell">
      <aside class="chat__sidebar">
        <div>
          <p class="section-tag">Canal principal</p>
          <h1>Chat</h1>
        </div>

        <div class="chat__identity">
          <div class="chat__identity-copy">
            <span>{{ user?.email }}</span>
            <strong>{{ connectionLabel }}</strong>
          </div>
          <button type="button" class="chat__logout" @click="signOut">Sair</button>
        </div>

        <p v-if="errorMessage" class="chat__error">{{ errorMessage }}</p>

        <div class="chat__stats">
          <article>
            <strong>{{ participants.length }}</strong>
            <span>Pessoas online</span>
          </article>
          <article>
            <strong>{{ messageCount }}</strong>
            <span>Mensagens</span>
          </article>
        </div>

        <ul class="chat__participants">
          <li v-for="participant in participants" :key="participant.id">
            <span class="dot" />
            {{ participant.name }}
          </li>
        </ul>
      </aside>

      <section class="chat__panel">
        <div ref="messagesContainer" class="chat__messages" role="log" aria-live="polite">
          <p v-if="!messages.length" class="chat__empty">Aguardando historico do chat...</p>

          <article
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="{ 'message--own': message.own }"
          >
            <header>
              <strong>{{ message.author }}</strong>
              <span>{{ message.time }}</span>
            </header>
            <p>{{ message.body }}</p>
          </article>
        </div>

        <form class="chat__composer" @submit.prevent="sendMessage">
          <label class="chat__field">
            <textarea
              v-model="draft"
              rows="3"
              placeholder="Escreva uma mensagem"
              :disabled="!isConnected"
            />
          </label>

          <div class="chat__actions">
            <button type="submit" :disabled="!isConnected || !draft.trim()">Enviar</button>
          </div>
        </form>
      </section>
    </section>
  </main>
</template>

<style scoped>
.chat-page {
  min-height: 100vh;
  padding: 20px;
}

.chat-shell {
  height: calc(100vh - 40px);
  width: min(1320px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 18px;
}

.chat__sidebar {
  display: grid;
  gap: 18px;
  padding: 24px;
  border-radius: var(--radius-xl);
  color: var(--color-paper-strong);
  background:
    radial-gradient(circle at top right, rgba(187, 75, 23, 0.24), transparent 26%),
    linear-gradient(155deg, var(--color-support), var(--color-primary));
  box-shadow: var(--shadow-soft);
}

.section-tag {
  margin: 0 0 10px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 250, 251, 0.72);
}

.chat__sidebar h1 {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  line-height: 1;
}

.chat__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.chat__identity {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 250, 251, 0.08);
}

.chat__identity-copy {
  display: grid;
  gap: 4px;
}

.chat__identity strong,
.chat__identity span {
  overflow-wrap: anywhere;
}

.chat__logout {
  padding: 12px 16px;
  border-radius: 999px;
  font-weight: 800;
  color: var(--color-paper-strong);
  background: rgba(255, 250, 251, 0.16);
}

.chat__error {
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  color: #fff4ea;
  background: rgba(104, 21, 12, 0.24);
  box-shadow: inset 0 0 0 1px rgba(255, 250, 251, 0.08);
}

.chat__stats article {
  padding: 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 250, 251, 0.08);
}

.chat__stats strong {
  display: block;
  font-size: 1.4rem;
}

.chat__stats span {
  color: rgba(255, 250, 251, 0.72);
}

.chat__participants {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.chat__participants li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 250, 251, 0.08);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f2bc9d;
  box-shadow: 0 0 0 6px rgba(242, 188, 157, 0.16);
}

.chat__panel {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 18px;
  height: 100%;
  padding: 20px;
  border-radius: var(--radius-xl);
  background: rgba(246, 241, 240, 0.96);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.chat__messages {
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 14px;
  overflow: auto;
}

.chat__empty {
  margin: auto;
  color: var(--color-ink-soft);
}

.message {
  max-width: 44rem;
  padding: 18px;
  border-radius: 22px 22px 22px 10px;
  color: var(--color-ink);
  background: rgba(183, 175, 178, 0.22);
}

.message header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.message strong {
  color: var(--color-primary);
}

.message span {
  color: var(--color-ink-soft);
  font-size: 0.88rem;
}

.message p {
  margin: 0;
  line-height: 1.6;
}

.message--own {
  margin-left: auto;
  border-radius: 22px 22px 10px 22px;
  color: var(--color-paper-strong);
  background: linear-gradient(135deg, var(--color-accent), #cf6d3f);
}

.message--own strong,
.message--own span {
  color: rgba(255, 250, 251, 0.9);
}

.chat__composer {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: var(--radius-lg);
  background: var(--color-paper-strong);
  box-shadow: var(--shadow-card);
}

.chat__field {
  display: block;
}

.chat__field textarea {
  width: 100%;
  resize: vertical;
  min-height: 108px;
  padding: 14px 16px;
  border-radius: 16px;
  color: var(--color-ink);
  background: rgba(183, 175, 178, 0.18);
  box-shadow: inset 0 0 0 1px rgba(85, 93, 90, 0.16);
}

.chat__field textarea::placeholder {
  color: rgba(85, 93, 90, 0.72);
}

.chat__field textarea:disabled,
.chat__composer button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.chat__composer button {
  padding: 14px 18px;
  border-radius: 999px;
  font-weight: 800;
  color: var(--color-paper-strong);
  background: linear-gradient(135deg, var(--color-accent), #cf6d3f);
  box-shadow: 0 16px 28px rgba(187, 75, 23, 0.28);
}

.chat__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}

@media (min-width: 980px) {
  .chat-shell {
    grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
    align-items: start;
  }

  .chat__sidebar {
    height: 100%;
    align-content: start;
  }
}

@media (max-width: 640px) {
  .chat-page {
    padding: 14px;
  }

  .chat-shell {
    height: calc(100vh - 28px);
  }

  .chat__identity {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
