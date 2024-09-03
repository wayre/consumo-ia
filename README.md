### Projeto backend: 
----
#### Serviço de Leitura de Consumo Utilizando Inteligência Artificial

No mundo moderno, a automação de processos e a utilização de inteligência artificial (IA) têm se tornado essenciais para otimizar a coleta e o gerenciamento de dados. Um exemplo prático dessa tendência é o desenvolvimento de serviços automatizados para a leitura e gestão de consumo de recursos como água e gás. Este projeto descreve o desenvolvimento de um back-end que facilita a leitura individualizada desses consumos, utilizando tecnologias modernas, como a API do Google Gemini.

#### Cenário

O objetivo principal do projeto é criar um serviço de back-end que gerencie a leitura de consumo de água e gás de forma automatizada. A inovação aqui reside na utilização da IA para obter a medição diretamente de uma foto do medidor, eliminando a necessidade de inserção manual dos dados.

#### Endpoints do Serviço

O back-end será composto por três principais endpoints, cada um com funcionalidades específicas e integradas com a API do Google Gemini para extração dos valores a partir das imagens.

##### 1. POST /upload

Este endpoint é responsável por receber uma imagem em formato base64 e processar essa imagem utilizando a API do Google Gemini para extrair o valor da medição. Além disso, ele verifica se já existe uma leitura registrada para o mesmo tipo de medição no mês atual, garantindo que não haja duplicidade.

**Requisitos do Endpoint:**
- Validar o tipo de dados dos parâmetros enviados, incluindo a imagem em base64.
- Integrar com a API do Google Gemini para extrair o valor numérico da imagem.
- Retornar um link temporário para a imagem, um GUID para a leitura, e o valor numérico extraído.

**Exemplo de Corpo de Requisição:**
```json
{
  "image": "base64",
  "customer_code": "string",
  "measure_datetime": "datetime",
  "measure_type": "WATER" ou "GAS"
}
```

**Exemplo de Resposta:**
```json
{
  "image_url": "string",
  "measure_value": integer,
  "measure_uuid": "string"
}
```

##### 2. PATCH /confirm

O endpoint de confirmação é utilizado para validar ou corrigir o valor lido pelo sistema. Ele verifica se o código de leitura (UUID) existe e se já foi confirmado, e então salva o novo valor no banco de dados.

**Requisitos do Endpoint:**
- Validar o tipo de dados dos parâmetros.
- Confirmar se o código de leitura existe e se já foi confirmado.
- Atualizar o valor no banco de dados.

**Exemplo de Corpo de Requisição:**
```json
{
  "measure_uuid": "string",
  "confirmed_value": integer
}
```

**Exemplo de Resposta:**
```json
{
  "success": true
}
```

##### 3. GET /<customer code>/list

Este endpoint permite listar todas as medições realizadas por um cliente específico. Ele pode opcionalmente receber um parâmetro de consulta (`measure_type`) para filtrar as leituras por tipo de recurso (água ou gás).

**Requisitos do Endpoint:**
- Receber o código do cliente e listar todas as medições associadas.
- Filtrar medições por tipo se o parâmetro `measure_type` for informado.
- Garantir que a validação do tipo seja case insensitive.

**Exemplo de Resposta:**
```json
{
  "customer_code": "string",
  "measures": [
    {
      "measure_uuid": "string",
      "measure_datetime": "datetime",
      "measure_type": "string",
      "has_confirmed": boolean,
      "image_url": "string"
    }
  ]
}
```

#### Tecnologias Utilizadas

O desenvolvimento deste projeto envolve diversas tecnologias que garantem a robustez e a eficiência do serviço:

- **Node.js com TypeScript:** Para criar uma API REST eficiente e segura.
- **Docker:** Para containerizar a aplicação, facilitando o desenvolvimento e a implantação.
- **Google Gemini API:** Para realizar a leitura e extração dos valores de consumo a partir de imagens.

#### Conclusão

Este projeto demonstra como a inteligência artificial pode ser aplicada para resolver problemas reais, como a leitura automatizada de consumos de água e gás. A integração com a API do Google Gemini permite que o sistema seja não apenas automatizado, mas também altamente preciso, reduzindo a necessidade de intervenção manual e possibilitando a coleta de dados de maneira eficiente e escalável. Este serviço, uma vez implementado, pode ser um grande passo em direção à modernização e à automação de processos em diversas indústrias.
