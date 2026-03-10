<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

function submitLogin() {
  login({
    email: form.email.trim(),
  })

  const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : null

  router.push(redirectPath || { name: 'chat' })
}
</script>

<template>
  <main class="login-page">
    <section class="login-layout">
      <div class="login-hero">
        <p class="section-tag">Agenda de Contatos</p>
        <h1>Converse com foco.</h1>
        <p class="login-hero__copy">
          Um ponto de entrada direto para a sua sala principal.
        </p>

        <div class="login-hero__panel">
          <span>Ambiente</span>
          <strong>Privado e contínuo</strong>
        </div>
      </div>

      <form class="login-card" @submit.prevent="submitLogin">
        <div class="login-card__header">
          <h2>Entrar</h2>
          <p>Acesse sua conta para abrir a conversa.</p>
        </div>

        <label>
          <span>E-mail</span>
          <input v-model="form.email" type="email" placeholder="ana@exemplo.com" required />
        </label>

        <label>
          <span>Senha</span>
          <input v-model="form.password" type="password" placeholder="Digite sua senha" required />
        </label>

        <button type="submit">Acessar chat</button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-layout {
  width: min(1080px, 100%);
  display: grid;
  gap: 18px;
}

.login-hero,
.login-card {
  border-radius: var(--radius-xl);
}

.login-hero {
  padding: 32px;
  color: var(--color-paper-strong);
  background:
    radial-gradient(circle at top right, rgba(187, 75, 23, 0.22), transparent 24%),
    linear-gradient(155deg, var(--color-primary), var(--color-support));
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

.login-hero h1 {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
  font-size: clamp(3rem, 6vw, 5.4rem);
  line-height: 0.92;
}

.login-hero__copy {
  max-width: 24rem;
  margin: 16px 0 0;
  line-height: 1.6;
  color: rgba(255, 250, 251, 0.86);
}

.login-hero__panel {
  display: inline-grid;
  gap: 6px;
  margin-top: 28px;
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  background: rgba(255, 250, 251, 0.1);
}

.login-hero__panel span {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 250, 251, 0.68);
}

.login-card {
  display: grid;
  gap: 16px;
  padding: 28px;
  background: var(--color-paper-strong);
  box-shadow: var(--shadow-card);
}

.login-card__header h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.6rem;
}

.login-card__header p {
  margin: 8px 0 0;
  color: var(--color-ink-soft);
}

.login-card label {
  display: grid;
  gap: 8px;
}

.login-card span {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-primary);
}

.login-card input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  color: var(--color-ink);
  background: rgba(183, 175, 178, 0.18);
  box-shadow: inset 0 0 0 1px rgba(85, 93, 90, 0.16);
}

.login-card input::placeholder {
  color: rgba(85, 93, 90, 0.72);
}

.login-card button {
  margin-top: 6px;
  padding: 14px 18px;
  border-radius: 999px;
  font-weight: 800;
  color: var(--color-paper-strong);
  background: linear-gradient(135deg, var(--color-accent), #cf6d3f);
  box-shadow: 0 16px 28px rgba(187, 75, 23, 0.28);
}

@media (min-width: 860px) {
  .login-layout {
    grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
    align-items: center;
  }

  .login-hero {
    min-height: 640px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .login-card {
    min-height: 520px;
    align-content: center;
  }
}
</style>
