<template>
  <h1>Hello App!</h1>
  <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
  <nav>
    <RouterLink to="/login">Ir para Login</RouterLink>
    <RouterLink to="/chat">Ir para Chat</RouterLink>
  </nav>
  <main>  
    <RouterView />
  </main>
</template>