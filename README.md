# ITS Lógica — Sistema Tutor Inteligente de Lógica de Programação

Aplicação web (React + TypeScript) que ensina lógica de programação de forma adaptativa: mapeia o conhecimento do aluno em um grafo de tópicos com pré-requisitos, recomenda o que estudar em seguida e conta com um tutor conversacional (chatbot construído em Rasa) para tirar dúvidas em tempo real.

## Visão geral

O projeto simula um **Intelligent Tutoring System (ITS)**:

- **Diagnóstico inicial** — antes de começar, o aluno responde a um diagnóstico que "semeia" seu nível em cada tópico.
- **Mapa de conhecimento** — os tópicos (Algoritmos, Variáveis, Entrada/Saída, Operadores, Condicionais, Laços, Funções, Vetores e Matrizes) são organizados em um grafo de dependências e níveis, e só são desbloqueados quando os pré-requisitos atingem um limiar de proficiência.
- **Lições e quizzes** — cada tópico tem uma lição seguida de questões de múltipla escolha em três níveis de dificuldade (básica, intermediária, avançada).
- **Modelo de proficiência** — acertos e erros ajustam a proficiência do aluno em cada tópico (ganho proporcional à dificuldade, penalidade maior para erros em conceitos básicos).
- **Recomendações pedagógicas** — o sistema sugere revisar pré-requisitos, reforçar conceitos com erros recorrentes (rastreando "concepções equivocadas") ou avançar para o próximo tópico.
- **Estatísticas de progresso** — tela dedicada com o histórico de respostas e evolução do aluno.
- **Tutor via chat (IA)** — um widget de chat conversa com o aluno sobre o tópico atual, dá dicas, explica conceitos e reage a acertos/erros, usando um backend Rasa treinado com intents e histórias específicas para tutoria.

## Arquitetura

```
its/its-logica/
├── src/
│   ├── components/     # UI: mapa, quiz, lição, diagnóstico, estatísticas, chat
│   ├── data/            # Tópicos, lições e banco de questões
│   ├── logic/           # Modelo de proficiência, diagnóstico, fila de questões, pedagogia
│   ├── hooks/           # useProgress — estado do aluno
│   └── App.tsx          # Composição das telas e navegação por abas
└── rasa/                # Backend do tutor conversacional (Rasa Open Source)
    ├── domain.yml       # Intents, slots e respostas do bot
    ├── data/            # NLU, regras e histórias de conversa
    ├── actions/         # Ações customizadas (dicas, explicações, feedback de quiz)
    └── docker-compose.yml
```

## Stack

- **Frontend**: React 19, TypeScript, Vite, Vitest (testes de lógica de modelo/fila)
- **Tutor conversacional**: [Rasa Open Source](https://rasa.com/) (NLU + Rules/Stories), servido via Docker
- **Estilo**: CSS puro com variáveis de tema (`App.css` / `index.css`)

## Rodando localmente

### Frontend

```bash
cd its/its-logica
npm install
npm run dev
```

Outros scripts disponíveis:

```bash
npm run build      # build de produção
npm run preview    # preview do build
npm run lint       # lint com ESLint
npm run test       # roda os testes com Vitest
```

### Tutor (Rasa)

Passo a passo para rodar tudo localmente:

1. **Treinar o modelo** (dentro de `rasa/`):
   ```bash
   docker run --rm -v "$PWD":/app rasa/rasa:3.6.20-full train
   ```
   Isso gera o `.tar.gz` em `rasa/models/`.

2. **Subir os containers**:
   ```bash
   docker compose up
   ```
   Sobe o `action-server` (porta 5055) e o servidor Rasa (porta 5005, com API e CORS habilitados).

## Como funciona a adaptação

- Cada tópico tem um `id`, `nível`, `deps` (pré-requisitos) e `relations` (conceitos relacionados/usados), formando um grafo.
- Um tópico é desbloqueado quando todos os seus pré-requisitos atingem o `UNLOCK_THRESHOLD` de proficiência.
- Acertar uma questão soma pontos proporcionais à dificuldade; errar subtrai mais pontos quanto mais básico for o conceito, sinalizando lacunas fundamentais.
- Erros repetidos na mesma questão/alternativa são agrupados como "concepções equivocadas" e usados para gerar recomendações direcionadas.
