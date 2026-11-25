# Presets da Roleta da Sorte

Os presets do sistema ficam neste diretório. O arquivo `index.json` funciona como manifesto e deve listar cada arquivo disponível na interface.

Modelo completo de preset:

```json
{
  "id": "identificador-unico",
  "name": "Nome exibido",
  "description": "Descrição curta da lista.",
  "icon": "nome_de_um_material_icon",
  "items": [
    {
      "label": "Primeira opção",
      "weight": 2,
      "color": "#4F46E5"
    },
    {
      "label": "Segunda opção",
      "weight": 1,
      "color": "#EC4899"
    }
  ]
}
```

Também é aceito o formato resumido `"items": ["Opção A", "Opção B"]`. Nesse caso, a página atribui peso `1` e cores automaticamente. `weight` é um peso relativo entre `1` e `100`; `color` deve usar o formato hexadecimal `#RRGGBB`.

Depois de criar o arquivo, adicione-o ao manifesto:

```json
{
  "id": "identificador-unico",
  "file": "nome-do-arquivo.json"
}
```
