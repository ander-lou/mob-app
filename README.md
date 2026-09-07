# MOB KL

Protótipo mobile-first, em português do Brasil, para avaliar a experiência de registro diário do Método de Ovulação Billings (MOB).

## O que já pode ser avaliado

- tela Hoje com observação, interpretação, orientação e grau de certeza separados;
- objetivos “espaçar gravidez” e “buscar gravidez” com orientações distintas;
- registro diário guiado em quatro etapas;
- calendário com vocabulário visual MOB e dias futuros neutros;
- detalhe do dia, revisão do registro e aviso de recálculo;
- conteúdo educativo sobre R1, R2, R3 e Regra do Ápice;
- modo discreto, notificações discretas e contraste reforçado;
- exportação demonstrativa em CSV;
- motor determinístico isolado com testes para cenários essenciais.

## Limites desta versão

Esta é uma demonstração de experiência com dados fictícios. Não possui conta, servidor, sincronização, armazenamento persistente, PWA offline, biometria nem motor clínico completo. A lógica e os textos não foram validados por instrutora MOB, responsável clínico, jurídico/LGPD ou avaliação regulatória/ANVISA. Não deve ser usada para decisões reais de saúde reprodutiva.

## Executar localmente

```bash
npm install
npm run dev
```

## Verificações

```bash
npm test
npm run build
```

O deploy para GitHub Pages é executado automaticamente a cada envio para a branch `main`.
