# Encurta Byx

Este é um projeto de encurtador de URL implementado em Node.js e Serverless Framework.

## Instalação

1. Certifique-se de ter o Node.js instalado em máquina.
2. Instale o Serverless Framework globalmente executando o seguinte comando:
    ```
    npm install -g serverless
    ```
3. Clone este repositório.

4. Navegue até o diretório do projeto:

    ```
    cd url-shortener
    ```

5. Instale as dependências do projeto:

    ```
    npm install
    ```
6. Instale o [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) e configure as credenciais.
    
    ```
    aws configure
    ```

## Implantação

Para implantar a aplicação, execute o seguinte comando:

```
npm run deploy
```
Na AWS deverá ser criado as funções Lambdas com seus respectivos API Gateway:
`url-shortener-dev-redirect`
`url-shortener-dev-shortenUrl`
`url-shortener-dev-getAccessLog`
`url-shortener-dev-getUrl`

Deverá ser criado também as tabelas `Urls` e `AccessLog` no `DynamoDB`.
**OBS:** Talvez será necessário ajustar as permissões de acesso das `Lambdas` direto pelo painel da AWS.

## Endpoints

- **Endpoint:** `POST /encurta_byx`
    - **Descrição:** Encurta uma URL longa para uma URL curta personalizada.

- **Endpoint:** `GET /encurta_byx`
    - **Descrição:** Obtém a lista de URLs encurtadas

- **Endpoint:** `GET /{shortUrl}`
    - **Descrição:** Redireciona o usuário para a URL original associada à URL curta.
    - **Parâmetros da URL:**
        - `shortUrl`: A URL curta a ser resolvida.

- **Endpoint:** `GET /access-log`
    - **Descrição:** Obtém o registro de acesso das URLs encurtadas.