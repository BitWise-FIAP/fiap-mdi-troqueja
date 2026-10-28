<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/img/logo-horizontal-dark.png">
    <img src="docs/img/logo-horizontal.png" alt="TrocaJá" width="420">
  </picture>
</p>

<p align="center"><b>O mural de trocas do campus.</b><br>
Troque ou doe livros, calculadoras, jalecos e móveis com estudantes perto de você.</p>

---

Projeto semestral de **Mobile Development & IoT** — Engenharia de Software, FIAP. Aplicativo em **React Native (Expo)** desenvolvido ao longo dos Checkpoints 4, 5 e 6.

## Integrantes

| Nome | RM | Papel |
| --- | --- | --- |
| Pedro Gaspar Fernandes Ferrari | 554887 | Product Owner e Dev Front-end (telas e navegação) |
| Enrico Ricarte Rodrigues | 558571 | Dev Back/Mock (camada de dados, Supabase, JSON mockado) e QA (testes Jest e roteiro manual) |
| Victor Freire | 556191 | Design (marca, logo, paleta, telas) e Dev Front-end (componentes visuais) |

## O problema

Todo semestre, calouros compram material que veteranos do mesmo campus têm parado em casa. A troca hoje acontece em grupos de WhatsApp, onde anúncios se perdem e não há como saber o que ainda está disponível. O TrocaJá organiza isso num mural com busca, propostas estruturadas e status claro — só troca ou doação, sem dinheiro.

Detalhes em [docs/escopo.md](docs/escopo.md) e [docs/pitch.md](docs/pitch.md).

## Status dos checkpoints

### ✅ CP4 — Idealização

| Entrega | Onde está |
| --- | --- |
| Repositório organizado com README | este arquivo |
| Escopo: problema, público-alvo, proposta de valor | [docs/escopo.md](docs/escopo.md) |
| Setup React Native/Expo e organização de pastas | [docs/decisoes-tecnicas.md](docs/decisoes-tecnicas.md#arquitetura) |
| Marca: nome, logo, paleta, tipografia | [docs/marca.md](docs/marca.md), [assets/brand](assets/brand) |
| Pitch, modelo de negócio e diferencial | [docs/pitch.md](docs/pitch.md) |
| Identidade visual e telas conceituais | [brand board](docs/img/brand-board.png), [telas conceituais anotadas](docs/img/telas-conceituais.png) e [marca](docs/marca.md#telas-conceituais) |

### ✅ CP5 — Protótipo funcional

| Entrega | Onde está |
| --- | --- |
| Protótipo navegável com dados mockados | `src/app`, dados em [src/data/mock](src/data/mock), API REST opcional com json-server |
| Ambiente de teste (Jest + roteiro manual) | [docs/roteiro-testes.md](docs/roteiro-testes.md) — 33 testes automatizados passando e 20 de 20 cenários manuais aprovados |
| README, telas e fluxos, decisões técnicas | [docs/telas-e-fluxos.md](docs/telas-e-fluxos.md), [docs/decisoes-tecnicas.md](docs/decisoes-tecnicas.md) |
| Integração com banco (Supabase) | Projeto `trocaja` no Supabase com schema e seed aplicados — [docs/supabase.md](docs/supabase.md), [supabase/](supabase), [evidência](docs/telas-e-fluxos.md#rodando-com-o-supabase) |
| Simulação rodando (print/vídeo) | Navegador: [prints](docs/img/prints) e [vídeo do fluxo](docs/img/fluxo-cp5.mp4) (32 s; o GitHub não toca .mp4 na página, use *View raw* para baixar) |

### ✅ CP6 — Entrega final

Planejado: login com Supabase Auth e RLS por usuário, foto do item pela câmera, notificações de proposta, APK via EAS Build.

## Funcionalidades

- Entrar com conta demo ou cadastro rápido
- Login feito em Supabase

## Como rodar

**Pré-requisitos:** Node.js 22.13 ou mais novo (exigido pelo Supabase JS e pela Testing Library) e npm. Para Android: Android Studio com um emulador criado (ou o app Expo Go compatível com o SDK 57 no celular).

```bash
git clone https://github.com/BitWise-FIAP/fiap-mdi-troqueja
cd trocaja
npm install
npx expo start
```

No terminal do Expo:

- `a` abre no **emulador Android** (deixe o emulador do Android Studio aberto antes)
- `w` abre no **navegador**
- ou escaneie o QR code com o **Expo Go**

Entre com **"Entrar com a conta demo"** (usuária Lia Moreira, e-mail `demo@trocaja.app`).

Sem `.env`, o app usa os **dados mockados**. Para usar o **Supabase**, siga [docs/supabase.md](docs/supabase.md).

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm start` | Inicia o Metro (Expo) |
| `npm run android` / `npm run web` | Abre direto no emulador Android / navegador |
| `npm test` | Roda os testes Jest |
| `npm run typecheck` | Verifica tipos com TypeScript |
| `npm run mock:api` | Sobe a API mock REST (json-server) em `localhost:3001` |
| `npm run gerar:seed` | Gera `supabase/seed.sql` e `mock-api/db.json` a partir dos JSON mockados |

## Estrutura

```
trocaja/
├── assets/            ícones do app, splash e arquivos da marca (assets/brand)
├── docs/              documentação, prints e vídeo
├── mock-api/          db.json do json-server
├── scripts/           gerador do seed
├── supabase/          schema.sql e seed.sql
├── __tests__/         testes Jest
└── src/
    ├── app/           telas (Expo Router)
    ├── components/    componentes reutilizáveis
    ├── data/mock/     dados mockados
    ├── services/      repositórios mock e Supabase
    ├── store/         estado global
    ├── theme/         tokens de design
    └── utils/         filtros, formatação e validação
```

## Tecnologias

Expo SDK 57 · React Native 0.86 · TypeScript · Expo Router · react-native-svg · Supabase · Jest + React Native Testing Library · json-server
