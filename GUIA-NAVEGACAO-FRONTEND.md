# Guia de navegacao do frontend

Este arquivo indica onde estao as telas, os botoes e as requisicoes HTTP do React.

## Arquivos principais

- [`src/main.jsx`](src/main.jsx): inicia o React.
- [`src/App.jsx`](src/App.jsx): telas, estado, requisicoes, cards e modal.
- [`src/styles.css`](src/styles.css): estilos da aplicacao.
- [`src/data/mockCompetitions.js`](src/data/mockCompetitions.js): lista das UFs e dados auxiliares.
- [`vite.config.js`](vite.config.js): configuracao do Vite e plugin React.

## URL do backend

Em [`src/App.jsx`](src/App.jsx), procure:

```javascript
const API_URL = 'http://127.0.0.1:8000'
```

Esse e o endereco usado pelo frontend para chamar o FastAPI.

## Tela de cadastro e edicao do usuario

Componente:

```javascript
ProfileScreen
```

Funcao de envio:

```javascript
submit(event)
```

Funcao que salva:

```javascript
saveProfile(nextProfile)
```

Ela salva no LocalStorage e envia `PUT /perfil` para o backend.

Para localizar:

```powershell
rg -n "ProfileScreen|saveProfile|submit|PUT|localStorage" src/App.jsx
```

## Tela de concursos

Componente:

```javascript
CompetitionsScreen
```

Essa tela possui filtros por:

- estado;
- situacao;
- texto de busca.

Funcao que busca recomendacoes:

```javascript
loadRecommendations()
```

Ela chama:

```javascript
fetch(`${API_URL}/recomendacoes`)
```

Funcao que sincroniza:

```javascript
syncAll()
```

Ela chama:

```javascript
fetch(`${API_URL}/sincronizacao?fonte=both`, { method: 'POST' })
```

Para localizar:

```powershell
rg -n "CompetitionsScreen|loadRecommendations|syncAll|/recomendacoes|/sincronizacao" src/App.jsx
```

## Cards dos concursos

Componente:

```javascript
CompetitionCard
```

Ele mostra titulo, organizacao, estado, situacao, compatibilidade e o botao `Ver analise`.

Funcao de conversao da resposta da API:

```javascript
mapRecommendation(item)
```

Essa funcao transforma o JSON do backend em um formato usado pelo card.

## Modal de mais informacoes

Componente:

```javascript
AnalysisModal
```

Ele abre quando o usuario clica em:

```javascript
onClick={() => onAnalyze(competition)}
```

O modal mostra:

- compatibilidade estimada;
- confianca do modelo;
- classe prevista;
- probabilidades;
- motivos;
- lacunas;
- salario identificado;
- posicoes identificadas;
- fonte e link original.

Para localizar:

```powershell
rg -n "CompetitionCard|AnalysisModal|onAnalyze|Ver análise|scoreBreakdown" src/App.jsx
```

## Fluxo do frontend

```text
ProfileScreen
    -> saveProfile
    -> PUT /perfil

CompetitionsScreen
    -> loadRecommendations
    -> GET /recomendacoes

Botao Sincronizar dados
    -> syncAll
    -> POST /sincronizacao?fonte=both

CompetitionCard
    -> Ver analise
    -> AnalysisModal
```

## Como estudar no VS Code

```text
Ctrl + P          abrir arquivo
Ctrl + Shift + F  pesquisar no projeto
Ctrl + G          ir para uma linha
Ctrl + Click      abrir funcao importada
```

Ordem recomendada para apresentar:

```text
src/App.jsx
    -> saveProfile
    -> loadRecommendations
    -> syncAll
    -> CompetitionCard
    -> AnalysisModal
```
