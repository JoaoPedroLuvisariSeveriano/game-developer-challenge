# Pirate Battle - Game Developer Challenge

Um simulador de batalha naval desenvolvido com um foco intransigente em arquitetura de software, entregando um motor gráfico 2D de alta performance aliado a um ecossistema robusto de integração de dados assíncronos e interfaces reativas.

## 🏗 Arquitetura e Tech Stack

As decisões de engenharia foram tomadas com vista à separação estrita de responsabilidades entre o motor do jogo (WebGL) e a Interface de Utilizador (DOM), garantindo estabilidade e escalabilidade:

- **PixiJS v8**: Escolhido como núcleo do motor gráfico pela sua renderização WebGL de alta performance, suportando nativamente a manipulação de geometria vetorial e cálculos rápidos de física num ciclo contínuo.
- **React & Tailwind CSS**: Utilizados exclusivamente para orquestrar as interfaces de utilizador (HUD, Menus). Esta abordagem modular garante uma renderização reativa, declarativa e de nível premium fora do *canvas*, isolando a UI da computação da física gráfica.
- **MSW (Mock Service Worker) & TanStack Query**: Implementados para orquestrar e estabilizar as camadas de rede. O MSW simula o consumo de APIs REST no navegador (com suporte a paginação e *loading states* estocásticos), enquanto o TanStack Query consome os *endpoints*, tratando do *caching*, estados de erro e reatividade, isolando por completo a lógica de estado do componente visual.
- **TypeScript**: Aplicada tipagem estrita (*Strict Mode*) na integridade total do código, garantindo um contrato inquebrável de ponta a ponta e total segurança operacional no *build* para produção.

## ⚙️ Destaques de Engenharia

- **Geração Procedural Segura**: A topologia das ilhas assenta numa matemática de geometria contínua ondulada (Metaballs suavizados e Distorção Elíptica). O algoritmo de *spawn* de adereços (flora, rochas) e das próprias massas de terra utiliza uma estrita **Validação Espacial Euclidiana**, iterando distâncias mínimas de segurança em cada eixo coordenado para erradicar a sobreposição de texturas.
- **Física Circular e Object Pooling**: As colisões físicas foram convertidas para matemática escalar de distância entre raios (círculos perfeitos), assegurando processamento *O(1)* ultrarrápido na barreira continente-mar. Todo o fogo cruzado e os efeitos de partículas são orquestrados através de **Object Pooling**, reciclando entidades para mitigar totalmente o ruído e estrangulamento da *Garbage Collection*, impedindo vazamentos de GPU.

## 🚀 Instruções de Instalação e Execução

Garante a utilização da versão Node.js especificada nas dependências do motor (>=20.19).

```bash
npm install
```

### Iniciar o Servidor Local (Desenvolvimento)

```bash
npm run dev
```
> **Nota:** A plataforma injetará e inicializará automaticamente o MSW (*Mock Service Worker*) no browser, intercetando todos os pedidos da API (Ranking e Histórico) silenciosamente na porta local para exibição total das mecânicas de *loading* e paginação.

### Compilar para Produção

Execute os seguintes comandos para exigir os *checks* do compilador TypeScript e expor o binário empacotado pelo Vite:

```bash
npm run build && npm run preview
```

## 📜 Assets & Licenses

Os ficheiros de áudio foram substituídos por pacotes de Domínio Público (CC0) do estúdio Kenney (UI Audio, Impact Sounds e Jingles) devido à inacessibilidade do repositório original de assets no momento da entrega.