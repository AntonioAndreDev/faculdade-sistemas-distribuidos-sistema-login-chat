# Como executar o projeto

## Requisitos

- Node.js instalado
- npm instalado

## Instalação

```bash
npm install
```

## Configuração do backend

Por padrão, o frontend tenta se conectar ao backend em `http://localhost:3000`.

Se precisar usar outra URL, crie um arquivo `.env` na raiz do projeto com:

```env
VITE_BACKEND_URL=http://localhost:3000
```

## Executar em desenvolvimento

```bash
npm run dev
```

Depois, abra no navegador a URL exibida no terminal, normalmente:

```text
http://localhost:5173
```

## Para criar mais de uma conta

Crie uma conta normalmente pela interface na aba pública do navegador e outra pela aba privada.
Dessa forma, é possível realizar a simulação de dois usuários diferentes convversando ao mesmo tempo.
