const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'ddpazv4iv',
  api_key: '385433234578277',
  api_secret: 'SeNDU_XefgpMS1r8sL6N_E5oBew'
});

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/images', async (req, res) => {
const { tag = 'aula8ifpe' } = req.query;
try {
  const result = await cloudinary.api.resources_by_tag(tag, {
  type: 'upload',
  prefix: '',
  max_results: 100,
});

res.json(result.resources);
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Erro ao buscar imagens' });
}
});

app.post('/delete-image', async (req, res) => {
const { public_id } = req.body;
  
if (!public_id) {
  
    return res.status(400).json({ error: 'public_id é obrigatório' });
}

try {
  const result = await cloudinary.uploader.destroy(public_id);
  res.json(result);
} catch (err) {
  console.error(err);
  res.status(500).json({ error: 'Erro ao deletar imagem' });
}
});

app.listen(PORT, () => {
console.log(`Servidor rodando em http://localhost:${PORT}`);
});