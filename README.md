# Elos

Plataforma de estimulação cognitiva adaptativa para pessoas idosas em lares e unidades de cuidados continuados.

Ajusta a dificuldade de cada exercício ao desempenho real do utente, exercício a exercício, e regista a evolução para a equipa acompanhar. Funciona sem ligação à internet.

---

## Porque é que isto é assim

Três decisões de engenharia que explicam o resto do projeto.

**Não há servidor.** A aplicação é estática. Não há contas, não há base de dados remota, não há chamadas de rede. Os registos ficam no armazenamento do navegador do próprio equipamento. Dados de saúde de pessoas vulneráveis não atravessam a internet se não precisarem de o fazer.

**Funciona offline por omissão.** Um service worker guarda a aplicação inteira — incluindo as tipografias — à primeira abertura. O contexto real é um tablet antigo com wi-fi mau num lar; uma falha de rede a meio de um exercício não pode acontecer à frente do utente.

**A dificuldade adapta-se sozinha.** Não há níveis fixos nem menus de dificuldade para o profissional gerir. O motor procura, para cada utente e cada domínio, a fasquia onde ele acerta cerca de 78% das vezes — desafiante sem ser desmoralizante.

---

## Instalar

### No servidor (GitHub Pages)

1. Criar um repositório e carregar o conteúdo desta pasta na raiz.
2. *Settings → Pages → Source: Deploy from a branch → main → / (root)*.
3. Ao fim de um minuto fica em `https://<utilizador>.github.io/<repositório>/`.

HTTPS é obrigatório para o service worker funcionar. O GitHub Pages já o dá. Abrir os ficheiros diretamente do disco (`file://`) faz a aplicação funcionar, mas sem instalação nem cache offline.

### No tablet ou telemóvel

| Sistema | Como |
|---|---|
| **Android / Chrome** | Abrir o endereço e tocar em **Instalar neste dispositivo** no rodapé, ou no aviso do próprio Chrome |
| **iPad / iPhone** | Abrir **no Safari** (não no Chrome) → botão Partilhar → **Adicionar ao ecrã principal** |
| **Windows / Mac** | Chrome ou Edge → ícone de instalação na barra de endereço |

Depois de instalado abre em ecrã inteiro, sem barra de endereço — o que impede o utente de sair da aplicação por engano. Manter o ícone premido no Android dá acesso direto a *Nova sessão*.

### Primeira configuração

1. **Definições → PIN**: mudar de `1234`.
2. **Definições → Instituição**: escrever o nome do lar. É usado como resposta certa no exercício de orientação espacial.
3. **Definições → Apagar tudo**: limpar os dados de demonstração antes do uso real.
4. Fazer uma cópia de segurança na primeira semana, para confirmar que o botão funciona naquele equipamento.

> **Os dados vivem no navegador daquele dispositivo.** Se alguém limpar os dados do navegador, perde-se tudo. A cópia de segurança semanal (Definições → Descarregar cópia) não é opcional: deve constar do procedimento escrito da instituição.

---

## Como funciona o motor adaptativo

Modelo logístico de um parâmetro, da família Rasch/Elo.

Cada utente tem uma capacidade estimada **θ** em cada um de seis domínios. Cada item tem uma dificuldade **d**. A probabilidade de acerto é

```
P = 1 / (1 + 10^((d − θ) / 25))
```

O sistema não escolhe itens ao acaso: escolhe a dificuldade que produz a taxa de acerto-alvo do modo selecionado.

```
d = θ − 25 · log₁₀( p / (1 − p) )
```

| Modo | Alvo | Para quem |
|---|---|---|
| Conforto | 85% | Utentes que se frustram depressa |
| Equilíbrio | 78% | Recomendado |
| Desafio | 66% | Utentes preservados que pedem mais |

Depois de cada item, θ é revisto pelo desvio entre o resultado e a previsão:

```
θ ← θ + K · (resultado − P)        K = 8 + 14 · e^(−n/8)
```

O passo **K** é grande enquanto há pouca informação sobre o utente e estabiliza com a prática — o perfil converge depressa nas primeiras sessões e deixa de saltar depois.

**Travão de frustração.** Três falhas seguidas baixam a dificuldade em 11 pontos e oferecem saída do exercício. Sem isto o motor é tecnicamente correto e humanamente errado: um utente com défice moderado desiste ao fim de dois minutos.

**Ordem da sessão.** Não é aleatória. Abre no domínio mais preservado, trabalha os mais frágeis a meio, fecha num domínio intermédio para a sessão terminar bem. É uma heurística de motivação, não um resultado de literatura.

---

## Exercícios

Nove exercícios, seis domínios. Cada um traduz a dificuldade pedida nos seus próprios parâmetros.

| Exercício | Domínio | O que adapta |
|---|---|---|
| Pares de Memória | Memória | Número de pares (2–8), pré-visualização, tolerância de tentativas |
| Sequência de Cores | Memória | Comprimento da sequência (2–9), velocidade |
| Lista de Compras | Memória | Tamanho da lista (3–10), exposição, distratores |
| Encontrar Iguais | Atenção | Grelha, número de alvos, semelhança dos distratores |
| Sinal Certo | Atenção | Janela de resposta, proporção de sinais a inibir |
| Provérbios | Linguagem | Raridade do provérbio, número de opções |
| Arrumar por Grupos | Executivas | Número de grupos, abstração da regra |
| Contas do Dia a Dia | Cálculo | Operação, grandeza dos números, cêntimos |
| Aqui e Agora | Orientação | Da parte do dia à contagem no calendário |

Os conteúdos são portugueses: provérbios ordenados por frequência de uso, contas em euros, lista de compras com bacalhau e marmelada, orientação que usa a data real e o nome da instituição. O reconhecimento do que é familiar não é decoração — é o que faz um utente de 88 anos participar.

---

## Acessibilidade

- **Atkinson Hyperlegible** em tudo o que o utente vê. Foi desenhada pelo Braille Institute para leitores com baixa visão, com formas de letra desambiguadas.
- Tamanho de letra por utente, até 150%.
- Modo de alto contraste por utente.
- Alvos de toque com 76 px de altura mínima.
- Modo de ritmo lento que alarga todos os tempos em 60%.
- Sons opcionais, gerados por Web Audio (sem ficheiros).
- Foco de teclado visível; `prefers-reduced-motion` respeitado.

---

## Limites

**O Elos não diagnostica.** Os índices (0–100) medem desempenho *nestes exercícios*, através de um modelo estatístico. Não são avaliação neuropsicológica, não estadiam demência e não substituem parecer médico. Servem para adaptar as sessões e para sinalizar alterações que valha a pena discutir com a equipa clínica.

A margem apresentada (`± n`) encolhe com o número de observações, mas é uma aproximação grosseira, não um intervalo de confiança formal.

**Antes de usar com utentes reais** é preciso autorização escrita da direção técnica, consentimento informado do utente ou representante legal, e supervisão de um profissional habilitado. Dados de saúde são categoria especial (art. 9.º do RGPD) e a população é vulnerável.

---

## Estrutura

```
index.html                aplicação completa (HTML, CSS e JS num ficheiro)
sw.js                     service worker — cache offline
manifest.webmanifest      metadados de instalação
fontes/                   tipografias auto-hospedadas (152 KB)
icones/                   ícones de instalação
```

Sem dependências, sem build, sem gestor de pacotes. Editar `index.html` e recarregar. Ao publicar uma alteração, subir o número em `VERSAO` no `sw.js` para que os dispositivos instalados recebam a nova versão.

---

## Licença

A definir pelo autor. As tipografias incluídas têm licenças próprias:
Atkinson Hyperlegible (OFL), Public Sans (OFL), Bricolage Grotesque (OFL).
