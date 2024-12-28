// server.js
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// Configura as variáveis de ambiente
dotenv.config();

// Converte o URL para o diretório
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rota principal (serve o arquivo HTML)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Middleware para interpretar JSON no body das requisições
app.use(express.json());

// Mapeamento de proporções de imagem
const aspectRatioMap = {
  '16:9': { width: 1344, height: 768 },
  '4:3': { width: 1088, height: 896 },
  '1:1': { width: 1024, height: 1024 },
  '9:16': { width: 768, height: 1344 }
};


// Rota para geração de imagens
app.post('/api/image-generator', async (req, res) => {
  try {
    const { prompt, style, viewpoint, lighting, aspectRatio, steps = 4 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    const dimensions = aspectRatioMap[aspectRatio] || aspectRatioMap['16:9'];
    const fullPrompt = [prompt, style, viewpoint, lighting]
      .filter(Boolean)
      .join(' ')
      .trim();

    const options = {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        steps: Math.min(Math.max(steps, 1), 4),
        n: 1,
        height: dimensions.height,
        width: dimensions.width,
        prompt: fullPrompt
      })
    };

    const apiResponse = await fetch('https://api.together.xyz/v1/images/generations', options);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('Erro na API Together.ai:', data);
      return res.status(apiResponse.status).json({
        error: 'Erro na geração da imagem',
        details: data.error || 'Sem detalhes disponíveis'
      });

    }

    // Extrai a URL da imagem do formato de resposta
    if (data?.data?.[0]?.url) {
      res.json({ imageUrl: data.data[0].url });
    } else {
      console.error('Resposta da API:', data);
      res.status(500).json({ error: 'Nenhuma imagem gerada' });
    }

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({
      error: 'Erro interno no servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
});


app.get('/download-image', async (req, res) => {
  try {
      const imageUrl = req.query.url;
      
      if (!imageUrl) {
          return res.status(400).send('URL da imagem é obrigatória');
      }

      // Faz a requisição da imagem usando node-fetch
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Defini headers para download
      res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename=generated-image-${Date.now()}.png`);
      
      // Converte a resposta para arrayBuffer e envia
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
      
  } catch (error) {
      console.error('Erro no download:', error);
      res.status(500).send('Erro ao baixar imagem');
  }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});