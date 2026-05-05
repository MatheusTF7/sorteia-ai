## Deploy para GitHub Pages (Quasar PWA)

Este arquivo descreve como publicar a build PWA do Quasar no branch `gh-pages` do GitHub.

### Pré-requisitos

- Ter o Quasar CLI instalado.
- Repositório Git no GitHub criado.
- Permissão para forçar push no branch `gh-pages` (usado para publicar os arquivos estáticos).

> Observação: substitua `SEU_USUARIO` e `NOME_DO_REPOSITORIO` pelo seu usuário/organização e repositório.

### Deploy inicial (criar o branch `gh-pages`)

1. Gere a build PWA:

```bash
quasar build -m pwa
```

2. Publique o conteúdo de `dist/pwa` no branch `gh-pages`:

```bash
cd dist/pwa
git init
git branch -M gh-pages
git remote add origin https://github.com/matheustf7/sorteia-ai.git
git add . -f
git commit -m "Deploy PWA Quasar"
git push -f origin gh-pages
```

### Deploy subsequente (atualizar o branch `gh-pages`)

Após alterações no projeto, repita a build e envie as alterações:

```bash
quasar build -m pwa
cd dist/pwa
git add . -f
git commit -m "Deploy"
git push -f origin gh-pages
```

Se preferir automatizar, considere usar `gh-pages` (npm) ou uma GitHub Action para publicar automaticamente a pasta `dist/pwa`.

---

Se quiser, eu posso adicionar um exemplo de GitHub Action para deploy automático.
