<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBackToChat = () => {
  router.push({ name: 'chat' })
}
</script>

<template>
  <section class="missing">
    <p class="missing__code">404</p>
    <h1>Essa rota saiu do mapa</h1>
    <p class="missing__copy">
      O endereço solicitado não existe nesta aplicação. Você pode voltar para o fluxo principal
      sem perder a navegação.
    </p>

    <div class="missing__actions">
      <button type="button" class="missing__primary" @click="goBackToChat">
        Ir para o chat
      </button>
      <RouterLink :to="{ name: 'login' }" class="missing__secondary">
        Voltar para login
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.missing {
  padding: 28px;
  border-radius: var(--radius-lg);
  color: var(--color-paper-strong);
  text-align: center;
  background:
    radial-gradient(circle at top center, rgba(187, 75, 23, 0.24), transparent 30%),
    linear-gradient(155deg, var(--color-primary), var(--color-support));
}

.missing__code {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 250, 251, 0.72);
}

.missing h1 {
  margin: 14px 0 0;
  font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 0.95;
}

.missing__copy {
  max-width: 34rem;
  margin: 16px auto 0;
  line-height: 1.7;
  color: rgba(255, 250, 251, 0.84);
}

.missing__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.missing__primary,
.missing__secondary {
  padding: 14px 18px;
  border-radius: 999px;
  font-weight: 800;
}

.missing__primary {
  color: var(--color-paper-strong);
  background: linear-gradient(135deg, var(--color-accent), #cf6d3f);
  box-shadow: 0 16px 28px rgba(187, 75, 23, 0.28);
}

.missing__secondary {
  color: var(--color-paper-strong);
  background: rgba(255, 250, 251, 0.12);
}
</style>
