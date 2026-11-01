# Arquitetura

## Aplicação

- React e TanStack Router compõem as telas e rotas.
- TanStack Query mantém as consultas do catálogo e do detalhe; Axios envia as chamadas REST para `/api`.
- Tailwind CSS define a apresentação responsiva e os tokens visuais estão em `src/index.css`.
- MSW fornece os handlers REST no desenvolvimento e nos builds de demonstração.
- Socket.IO envia atualizações periódicas de preço no servidor Vite e na Function configurada para a Vercel.

## Estado

Busca, categoria, faixa de preço, ordenação, rede e página são codificadas na URL. O carrinho e os favoritos são persistidos no `localStorage` e separados por usuário. O carrinho de visitante é combinado ao carrinho da conta no login.

Cadastro e dados de conta são locais ao navegador. As senhas de contas fictícias são persistidas como digest SHA-256. Sessão, perfil, carteiras e pedidos também usam armazenamento do navegador; não há persistência no servidor. A sessão dura uma hora e o token legado fixo é descartado.

## Contratos REST simulados

| Método | Caminho | Uso |
| --- | --- | --- |
| GET | `/api/nfts` | Busca e filtros do catálogo |
| GET | `/api/nfts/:nftId` | Detalhe do NFT |
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/social` | Sessão fictícia para Google ou Facebook |
| POST | `/api/auth/logout` | Encerramento simulado |
| POST | `/api/auth/change-password` | Alteração de senha |
| GET, PUT | `/api/profile` | Leitura e gravação do perfil |
| GET, POST, PUT, DELETE | `/api/wallets` | Carteiras e NFTs comprados associados |
| POST | `/api/cart/validate` | Validação de disponibilidade e quantidade |
| POST | `/api/coupons/validate` | Validação de cupom |
| POST | `/api/orders` | Criação idempotente do pedido simulado |
| GET | `/api/orders/:orderId` | Recuperação do recibo |

Pedidos guardam um snapshot dos itens, preços e totais. A chave `Idempotency-Key` recupera a mesma operação e rejeita conteúdo diferente. Os cenários `declined` e `timeout-after-create` simulam recusa e timeout recuperável.

## Eventos

O cliente `socket.io-client` escuta `nft.updated` e `order.updated`. Atualizações de NFT têm identificador, preço, disponibilidade e versão; versões antigas e duplicadas não substituem uma versão mais recente. Ao reconectar, o catálogo é invalidado para buscar novamente a API. O servidor de demonstração emite ciclos de preço para os NFTs do fixture.

## Limites atuais

- Não há backend persistente, autenticação de produção, recuperação ou verificação de e-mail, pagamento real ou integração blockchain.
- Os botões sociais criam uma identidade local de demonstração. Não autenticam junto ao Google/Facebook nem substituem OAuth.
- Favoritos são locais e não têm contrato REST. O endpoint de carrinho valida itens, mas o estado do carrinho é local.
- A simulação realtime publica alterações de NFT; o cliente escuta `order.updated`, mas a simulação não produz esse evento nem mantém estado compartilhado entre instâncias da Function.
- O checkout obtém uma cotação atual da API. Se o preço mudar desde a abertura da tela, atualiza o resumo e exige nova confirmação; o endpoint do pedido verifica novamente a cotação antes de criar a compra.
- O projeto usa componentes React próprios com Tailwind; não inclui componentes shadcn/ui.
- A suíte Playwright cobre os fluxos em `e2e/core-flows.spec.ts`; `e2e/visual-regressions.spec.ts` mantém referências visuais de quatro telas nos três viewports configurados.
- `npm run audit:lighthouse` gera três medições por página e perfil em `lighthouse-reports/`. Nesta execução, Performance mobile ficou em 75 e desktop em 89 (início) e 88 (detalhe); a meta é 90. Acessibilidade, Boas práticas e SEO atingiram as metas registradas no resumo.
- A versão da Vercel é uma demonstração. O armazenamento local e os valores fictícios não são adequados para transações ou contas reais.
