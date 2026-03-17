<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../composables/useAuth'

const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')

const form = reactive({
  email: '',
  password: '',
})

async function submitRegister() {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const result = await register({
      email: form.email.trim(),
      password: form.password,
    })

    if (result.authenticated) {
      router.push({ name: 'chat' })
      return
    }

    router.push({
      name: 'login',
      query: {
        registered: '1',
        email: form.email.trim(),
      },
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Falha ao criar conta.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="register-page">
    <section class="register-layout">
      <div class="register-hero">
        <p class="section-tag">Agenda de Contatos</p>
        <h1>Crie sua conta.</h1>
        <p class="register-hero__copy">
          Cadastre e entre no canal principal com email e senha.
        </p>

        <div class="register-hero__panel">
          <span>Cadastro</span>
          <strong>Integrado ao backend</strong>
        </div>
      </div>

      <form class="register-card" @submit.prevent="submitRegister">
        <div class="register-card__header">
          <h2>Criar conta</h2>
          <p>Preencha os dados para registrar um novo acesso.</p>
        </div>

        <p v-if="errorMessage" class="register-card__error">{{ errorMessage }}</p>

        <label>
          <span>E-mail</span>
          <input
            v-model="form.email"
            type="email"
            placeholder="ana@exemplo.com"
            autocomplete="username"
            required
          />
        </label>

        <label>
          <span>Senha</span>
          <input
            v-model="form.password"
            type="password"
            placeholder="Crie uma senha"
            autocomplete="new-password"
            required
          />
        </label>

        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Criando conta...' : 'Criar conta' }}
        </button>

        <RouterLink class="register-card__link" :to="{ name: 'login' }">
          Voltar para o login
        </RouterLink>
      </form>
    </section>
  </main>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.register-layout {
  width: min(1080px, 100%);
  display: grid;
  gap: 18px;
}

.register-hero,
.register-card {
  border-radius: var(--radius-xl);
}

.register-hero {
  padding: 32px;
  color: var(--color-paper-strong);
  background:
    radial-gradient(circle at top right, rgba(85, 93, 90, 0.18), transparent 24%),
    linear-gradient(155deg, #8f4a2f, var(--color-primary));
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

.register-hero h1 {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
  font-size: clamp(3rem, 6vw, 5.4rem);
  line-height: 0.92;
}

.register-hero__copy {
  max-width: 26rem;
  margin: 16px 0 0;
  line-height: 1.6;
  color: rgba(255, 250, 251, 0.86);
}

.register-hero__panel {
  display: inline-grid;
  gap: 6px;
  margin-top: 28px;
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  background: rgba(255, 250, 251, 0.1);
}

.register-hero__panel span {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 250, 251, 0.68);
}

.register-card {
  display: grid;
  gap: 16px;
  padding: 28px;
  background: var(--color-paper-strong);
  box-shadow: var(--shadow-card);
}

.register-card__header h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.6rem;
}

.register-card__header p {
  margin: 8px 0 0;
  color: var(--color-ink-soft);
}

.register-card__error {
  margin: 0;
  padding: 12px 14px;
  border-radius: 14px;
  color: #8b2e23;
  background: rgba(209, 109, 63, 0.16);
  box-shadow: inset 0 0 0 1px rgba(139, 46, 35, 0.14);
}

.register-card label {
  display: grid;
  gap: 8px;
}

.register-card span {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-primary);
}

.register-card input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  color: var(--color-ink);
  background: rgba(183, 175, 178, 0.18);
  box-shadow: inset 0 0 0 1px rgba(85, 93, 90, 0.16);
}

.register-card input::placeholder {
  color: rgba(85, 93, 90, 0.72);
}

.register-card button {
  margin-top: 6px;
  padding: 14px 18px;
  border-radius: 999px;
  font-weight: 800;
  color: var(--color-paper-strong);
  background: linear-gradient(135deg, var(--color-accent), #cf6d3f);
  box-shadow: 0 16px 28px rgba(187, 75, 23, 0.28);
}

.register-card button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.register-card__link {
  justify-self: center;
  font-weight: 700;
  color: var(--color-primary);
}

@media (min-width: 860px) {
  .register-layout {
    grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
    align-items: center;
  }

  .register-hero {
    min-height: 640px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .register-card {
    min-height: 520px;
    align-content: center;
  }
}
</style>
