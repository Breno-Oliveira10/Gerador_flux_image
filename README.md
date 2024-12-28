# Gerador de Imagens Flux

## 📝 Descrição do Projeto

Este projeto utiliza a API da plataforma together.ai, que usa o modelo de geração de imagens FLUX.1-schnell. O objetivo é facilitar a criação de imagens de forma dinâmica a partir de prompts de texto. O usuário insere uma descrição textual, escolhe os parâmetros e a aplicação gera as imagens correspondentes.

## 📝 **Funcionalidades**

- Geração dinâmica de imagens com diferentes estilos, proporções e outros ajustes.
- Interface responsiva para dispositivos móveis, tablets e desktops.
- Preview interativo de imagens geradas, onde você pode clicar em uma imagem para ampliá-la e ver todas as imagens geradas no formato de galeria.
- Navegação entre imagens com botões (próxima/anterior).
- Opção de download e zoom nas imagens geradas.

## 🌟 **Como Usar**

1. Na página inicial, insira os parâmetros para a geração de imagens:

- Texto do prompt: Descrição da imagem a ser gerada.
- Estilo: Escolha o estilo visual desejado.
- Proporção: Defina a proporção da imagem.
- Outros ajustes: Ponto de vista, iluminação, etc.

2. Clique em **Generate** para iniciar o processo.

3. Veja as imagens geradas na interface. Você pode:

- Clicar em uma imagem para ampliá-la.
- Navegar entre imagens usando os botões (próxima/anterior).
- Fazer download das imagens.

4. **Gerar Mais Imagens**

- Caso queira gerar mais imagens com os mesmos prompts, clique em **Generate more images**. A aplicação irá gerar um novo conjunto de imagens baseadas nos prompts inseridos, permitindo que você altere também as configurações como proporção, estilo, visão e iluminação.


## ⚙️ Configuração e Execução

1. **Pré-requisitos**

- **Node.js:** Certifique-se de que o Node.js e o npm estão instalados.  
  Para verificar, execute no terminal:  
  ```bash
  node -v
  npm -v
  ```
   - Se não estiver o **Node.js** instalado no computador, acesse [aqui](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) para baixar.  
   - Dependências necessárias:
     - **Express.js**: Framework para construir o servidor.  
     - **Node-fetch**: Para realizar chamadas HTTP à API.  
     - **Dotenv**: Para gerenciar variáveis de ambiente.  
   Todas essas dependências serão instaladas automaticamente ao rodar o comando:

   ```bash
   npm install
    ```

2. **Clone o repositório:**

    ```bash
    git clone https://github.com/Breno-Oliveira10/Gerador_flux_image.git
    cd Gerador_flux_image
    ```

3. **Configure a API da Together.ai**

    - Consulte a [documentação-oficial](https://docs.together.ai/docs/introduction) para criar sua conta e configurar o serviço.

    - Entenda como funciona o endpoint de geração de imagens na [documentação-de-referência](https://docs.together.ai/reference/post_images-generations).


4. **Antes de rodar o projeto, é necessário configurar as variáveis de ambiente:**

    - Faça uma cópia do arquivo `.env.example` e renomeie para `.env`.
    - coloque nele seu token que você ganhou ao se cadastrar na plataforma assim:
   
   ```bash
   API_KEY=SEU_TOKEN_DE_API_AQUI
    ```

5. **Instale as dependências** 

   - Certifique-se de que o Node.js está instalado e instale as dependências do projeto:

    ```bash
   npm install
    ```

6. **Iniciar o Servidor:**

     - Para rodar a aplicação localmente, no terminal execute:

        ```bash
       node src/server.js
        ```

7. **Acessar a aplicação:**

    - Abra seu navegador e acesse:

     ```bash
    http://localhost:3000/
     ```
     - Insira o prompt de texto nos campos apropriados. 
     - Escolha os parâmetros da imagem, como estilo, visão, iluminação e proporção.
     - Clique em **Generate** para criar as imagens. As imagens geradas serão exibidas na tela.
     
