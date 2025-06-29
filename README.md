
## 🚀 Uma Solução para a Organização Diária

O **Gerenciador de Tarefas** é um aplicativo móvel intuitivo, desenvolvido para ajudar indivíduos a organizar e gerenciar suas atividades diárias de forma eficiente. Em um mundo cada vez mais agitado, manter o controle sobre compromissos e pendências é fundamental para reduzir o estresse e aumentar a produtividade. Este aplicativo oferece uma plataforma simples para que você nunca mais se esqueça de um prazo ou tarefa importante.


## 📁 Estrutura do Projeto

**A estrutura de diretórios do projeto é organizada para promover clareza, manutenibilidade e escalabilidade, seguindo um padrão comum em aplicações React Native/Expo:**

```
gerenciador-de-tarefas/
├── .expo/                   # Arquivos de configuração internos do Expo
├── assets/                  # Imagens, ícones e outros ativos visuais
├── src/                     # Código-fonte principal da aplicação
│   ├── components/          # Componentes React reutilizáveis (ex: AppLayout.tsx)
│   ├── database/            # Lógica de interação com o banco de dados SQLite (ex: database.ts)
│   ├── screens/             # Telas principais da aplicação (ex: TaskListScreen.screen.tsx)
│   ├── types/               # Definições de tipos TypeScript comuns à aplicação
│   ├── App.tsx              # Ponto de entrada principal da aplicação React Native
├── .gitignore               # Arquivos e pastas a serem ignorados pelo Git
├── app.json                 # Configurações globais do aplicativo (nome, ícones, IDs de cliente)
├── eas.json                 # Configurações para o EAS Build e EAS Update
├── package.json             # Metadados do projeto e lista de dependências
├── tsconfig.json            # Configurações do compilador TypeScript
└── index.ts                 # Nota: Este index.ts é o padrão do Expo para a raiz. O conteúdo principal está em src/.
```


## ✨ Funcionalidades Principais

* **Gestão Completa de Tarefas** **: Adicione novas tarefas com título e descrição, edite detalhes e remova tarefas concluídas ou desnecessárias.**
* **Controle de Status** **: Marque tarefas como "Pendente" ou "Concluída" com facilidade, visualizando o progresso instantaneamente.**
* **Filtros Inteligentes** **: Organize sua lista visualizando todas as tarefas, apenas as pendentes ou somente as concluídas.**
* **Visualização Detalhada** **: Acesse uma tela dedicada para ver todas as informações de cada tarefa.**
* **Autenticação Segura com Google** **: Faça login usando sua conta Google para personalizar sua experiência e manter seus dados associados.**
* **Dados Locais e Seguros** **: Todas as suas tarefas são armazenadas diretamente no seu dispositivo, garantindo acesso rápido e privacidade.**
* **Design Moderno e Intuitivo** **: Interface de usuário limpa e com uma paleta de cores roxa consistente, seguindo as melhores práticas de UI/UX.**

## 🛠️ Tecnologias Adotadas

**O projeto foi construído sobre uma base sólida de tecnologias modernas de desenvolvimento móvel:**

* **React Native** **: Framework para desenvolvimento de aplicativos nativos multiplataforma.**
* **Expo** **: Conjunto de ferramentas que simplifica o desenvolvimento e a execução de apps React Native.**
* **SQLite (via `expo-sqlite`)** **: Banco de dados local para persistência de dados no dispositivo.**
* **React Navigation** **: Para gerenciar a navegação entre as telas do aplicativo.**
* **Expo Auth Session / Google Sign-In** **: Para a integração com a autenticação Google.**
* **Async Storage** **: Armazenamento de dados simples para persistir a sessão do usuário.**
* **MaterialIcons (via `@expo/vector-icons`)** **: Coleção de ícones para uma interface rica.**

## 🚀 Como Rodar o Projeto Localmente

**Siga estes passos para configurar e executar o aplicativo em seu ambiente de desenvolvimento:**

### 1. Pré-requisitos

Certifique-se de ter o **Node.js** (versão LTS recomendada) e o **Expo CLI** instalados em sua máquina:

```
# Instalar Node.js: Baixe em https://nodejs.org/
# Instalar Expo CLI e EAS CLI (Ferramenta necessária para URLs públicas do Expo)
npm install -g expo-cli eas-cli

```

### 2. Clonar o Repositório

**Clone o código-fonte do aplicativo para o seu computador:**

```
git clone https://github.com/aguiarEdu101/task-manager-app
cd gerenciador-de-tarefas # Navegue até a pasta do projeto

```

### 3. Instalar Dependências

**No diretório raiz do projeto, instale todas as dependências necessárias:**

```
npm install
# OU, se preferir yarn:
# yarn install

# Garanta que as dependências do Expo estejam corretamente vinculadas:
npx expo install

```

### 4. Configurar Autenticação Google (essencial para login)

Para que o login com o Google funcione corretamente em seu ambiente local (via Expo Go), você precisa configurar suas credenciais do Google Cloud Console e o arquivo `app.json`. 

Observe o arquivo app.example.json

1. **Obtenha seus IDs de Cliente Google** **:**

* **Acesse o** [Google Cloud Console](https://console.cloud.google.com/ "null").
* **Crie ou selecione um projeto.**
* Vá em **"APIs & Services" > "Credentials"** **.**
* **Clique em** **"+ CREATE CREDENTIALS"** e selecione  **"OAuth client ID"** **.**
* **Crie um** **"Web application"** ID de cliente. Não é necessário configurar URIs de redirecionamento agora para este tipo.

1. **Adicione os IDs ao `app.json`**:
   Abra o arquivo `app.json` na raiz do seu projeto e adicione a seção `extra` com os IDs de cliente obtidos. **Substitua `SEU_CLIENT_ID_WEB_AQUI` pelos seus IDs reais.**

```
   {
     "expo": {
       // ... outras configurações do Expo
       "owner": "SEU_USERNAME_EXPO_AQUI", // Substitua pelo seu nome de usuário do Expo!
       "extra": {
         "googleWebClientId": "<SEU_CLIENT_ID_WEB_AQUI>.apps.googleusercontent.com",
         "googleAndroidClientId": "<SEU_CLIENT_ID_WEB_AQUI>.apps.googleusercontent.com", // Geralmente o mesmo do Web para Expo Go
         "googleIosClientId": "<SEU_CLIENT_ID_WEB_AQUI>.apps.googleusercontent.com"    // Geralmente o mesmo do Web para Expo Go
       },
       "android": {
           "package": "com.seuprojeto.nomeapp" // Opcional: defina um nome de pacote único, ex: com.seunome.gerenciadortarefas
       },
       "ios": {
           "bundleIdentifier": "com.seuprojeto.nomeapp" // Opcional: defina um bundle ID único
       }
     }
   }

```

   **Lembre-se de substituir `SEU_USERNAME_EXPO_AQUI` pelo seu nome de usuário da conta Expo.**

1. **Gerar a URL Pública de Redirecionamento do Expo**:
   Esta etapa é **CRUCIAL** para que o login do Google funcione. Ela gera uma URL pública para seu aplicativo que o Google pode aceitar.

```
   eas update --branch main --message "mensagem adequada"

```

   Este comando irá publicar uma "atualização" do seu código para os servidores do Expo. No final, ele exibirá uma URL no formato `https://auth.expo.io/@SEU_USERNAME_EXPO_AQUI/slug-do-projeto.`

Essas informações estão no `app.json`

1. **Atualizar URIs de Redirecionamento no Google Cloud Console** **:**

* Retorne ao [Google Cloud Console](https://console.cloud.google.com/ "null").
* Vá em  **"APIs & Services" > "Credentials"** **.**
* Clique no **ID do Cliente OAuth** do tipo "Web application" que você criou.
* Na seção **"Authorized redirect URIs"** **:**
  * **Adicione a URI publica obtida**
* **Salve** as alterações.

### 5. Iniciar o Aplicativo

**Com tudo configurado, você pode iniciar o servidor de desenvolvimento do Expo:**

```
npx expo start --clear

```

**Este comando abrirá uma página no seu navegador com um QR code.**

### 6. Executar no seu Dispositivo/Emulador

* **Recomendado** : Baixe o aplicativo **Expo Go** na Google Play Store (Android) ou Apple App Store (iOS). Abra o Expo Go no seu celular/emulador e escaneie o QR code exibido no terminal.
* **O aplicativo deverá carregar e o login do Google deverá funcionar corretamente.**

## 📄 Licença

**Este projeto está licenciado sob a Licença MIT.**

## ✉️ Contato

**soc.edu01@sempreceub.com**
