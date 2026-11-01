# Kurio NFT Marketplace

Marketplace responsivo desenvolvido em React, TypeScript e Vite para o desafio de frontend. A interface usa TanStack Router, TanStack Query, Axios, Tailwind CSS, MSW e Socket.IO. Os dados, a autenticação e os pagamentos são simulados; nenhuma transação real é realizada.

## Requisitos

- Node.js 22.19+
- npm

## Executar localmente

```sh
npm install
npm run dev
```

O servidor de desenvolvimento ativa os handlers MSW. Para conferir o build de demonstração:

```sh
npm run build:demo
npm run preview
```

## Ambientes

- `.env.demo`: ativa MSW no build de demonstração e usa o caminho Socket.IO local `/socket.io/`.
- `.env.vercel`: ativa MSW no build publicado e define `VITE_SOCKET_PATH=/api/socket-io/socket.io/`.
- Não há chaves ou credenciais externas. Os dados de conta são fictícios e locais ao navegador.

Para gerar a auditoria Lighthouse (três medições por página em mobile e desktop):

```sh
npm run audit:lighthouse
```

Os relatórios HTML/JSON e a mediana de Performance, Acessibilidade, Boas práticas, SEO, LCP, CLS e TBT são gravados em `lighthouse-reports/`. O comando requer Chromium instalado pelo Playwright.

## Conta de demonstração

- E-mail: `demo@kurio.com`
- Senha: `kurio123`

Também é possível criar uma conta fictícia. As contas e os dados ficam no armazenamento do navegador em uso e não são compartilhados entre dispositivos.

## Cenários disponíveis

- `GENESIS10`: cupom válido de 10%.
- `EXPIRED`: cupom expirado.
- `/payment?scenario=declined`: simula pagamento recusado.
- `/payment?scenario=timeout-after-create`: simula timeout após a criação e permite recuperar o pedido reenviando a mesma operação.
- Os preços do catálogo oscilam por Socket.IO; Emerald Ape percorre `1.19`, `1.29` e `1.31 ETH`.
- Limpar os dados do site reinicia as contas e os dados locais.

## Verificações

```sh
npm run build
npm run build:demo
npm run build:vercel
npm run typecheck
npm run lint
npm run test:e2e
npm run audit:lighthouse
```

Os testes Playwright usam Chromium nos projetos desktop e mobile. Instale o navegador com `npx playwright install chromium` quando necessário. O relatório HTML é gravado em `playwright-report/`.

Início, login e cadastro receberam ajustes visuais com base nos arquivos mobile do Figma; detalhe, carrinho e pagamento continuam responsivos nos viewports cobertos pelos testes. Login e cadastro oferecem demonstrações de entrada Google/Facebook; não há redirecionamento OAuth nem acesso a contas externas.

O Playwright também mantém capturas de referência para início, detalhe, carrinho e pagamento nos viewports de 390, 768 e 1440 px. Os arquivos ficam em `e2e/visual-regressions.spec.ts-snapshots/`.

## Deploy na Vercel

O arquivo `vercel.json` configura o build `npm run build:vercel`, a saída `dist` e o fallback das rotas do aplicativo. O modo `vercel` ativa os mocks e direciona o Socket.IO a `api/socket-io.ts`. Publique pelo repositório Git e confira a URL resultante, incluindo abertura direta e refresh das rotas.

## Escopo da demonstração

Cadastro, sessão, perfil, carteiras, favoritos, carrinho e pedidos são simulações no navegador. Não existe backend persistente, confirmação de e-mail, integração de carteira, pagamento ou blockchain. O estado não é compartilhado entre usuários em dispositivos diferentes.

Consulte [ARCHITECTURE.md](./ARCHITECTURE.md) para os contratos e limites da implementação.
