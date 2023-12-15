var Express = require("express");
const mongoose = require('mongoose');
var Mongoclient = require("mongodb").MongoClient;
var cors=require("cors");
const multer = require("multer");
const bodyParser = require('body-parser');

var app=Express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });

var CONNECTION_STRING = "mongodb+srv://cleiweb1:cleiweb1@cluster0.ktsnpdi.mongodb.net/kanban?retryWrites=true&w=majority";
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true });

// Definir o esquema do usuário
const usuarioSchema = new mongoose.Schema({
  email: String,
  senha: String,
  colunas: [
    {
      titulo: String,
      ordem: Number,
      tarefas: [
        {
          ordem: Number,
          titulo: String,
          descricao: String,
        }
      ]
    }
  ]
});

const Usuario = mongoose.model('Tarefa', usuarioSchema);

// Rota para autenticar usuário
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
  
    try {
      const usuario = await Usuario.findOne({ email, senha });
      if (usuario) {
        console.log("Usuário autenticado com sucesso!");
        res.status(200).json({ usuario:usuario, message: 'Usuário autenticado com sucesso!' });
      } else {
        console.log("Credenciais inválidas");
        res.status(401).json({ message: 'Credenciais inválidas' });
      }
    } catch (error) {
        console.log("Erro ao autenticar usuário");
        res.status(500).json({ message: 'Erro ao autenticar usuário' });
    }
});

app.post('/adicionar-tarefa', async (req, res) => {
  const { userId, colunaId, tarefa } = req.body;
  try {
    // Encontrar o usuário pelo ID
    const usuario = await Usuario.findById(userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Encontrar a coluna pelo ID
    const coluna = usuario.colunas.find((c) => c._id.equals(colunaId));

    if (!coluna) {
      return res.status(404).json({ message: 'Coluna não encontrada' });
    }

    // Inicializar colunas.tarefas se ainda não existir
    if (!coluna.tarefas) {
      coluna.tarefas = [];
    }

    const novaTarefa = {
      titulo: tarefa.titulo,
      ordem: tarefa.ordem,
      descricao: "",
    };

    coluna.tarefas.push(novaTarefa);

    // Salvar as alterações no banco de dados
    const atualizado = await usuario.save();
    const colunaAtualizada = atualizado.colunas.find((c) => c._id.equals(colunaId));
    const tarefaAtualizada = colunaAtualizada.tarefas[colunaAtualizada.tarefas.length - 1]

    res.status(200).json({ message: 'Tarefa adicionada com sucesso', novaTarefa: tarefaAtualizada });
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.put('/atualizar-tarefa/:userId/:colunaId/:tarefaId', async (req, res) => {
  const { userId, colunaId, tarefaId } = req.params;
  const { titulo, ordem, descricao } = req.body;

  try {
    const usuario = await Usuario.findOneAndUpdate(
      { _id: userId, 'colunas._id': colunaId, 'colunas.tarefas._id': tarefaId },
      {
        $set: {
          'colunas.$[coluna].tarefas.$[tarefa].titulo': titulo,
          'colunas.$[coluna].tarefas.$[tarefa].ordem': ordem,
          'colunas.$[coluna].tarefas.$[tarefa].descricao': descricao,
        },
      },
      { arrayFilters: [{ 'coluna._id': colunaId }, { 'tarefa._id': tarefaId }], new: true }
    );

    if (usuario) {
      res.status(200).json({ usuario, message: 'Tarefa atualizada com sucesso!' });
    } else {
      res.status(404).json({ message: 'Tarefa não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro ao atualizar tarefa' });
  }
});

// Vai ser usado para remover tarefas e alterar a ordem das tarefas, finalizando o crud de tarefas
app.put('/atualizar-tarefas-coluna/:userId/:colunaId', async (req, res) => {
  const { userId, colunaId } = req.params;
  const { tarefas } = req.body;
  try {
    const usuario = await Usuario.findOneAndUpdate(
      { _id: userId, 'colunas._id': colunaId },
      {
        $set: {
          'colunas.$.tarefas': tarefas,
        },
      },
      { new: true }
    );

    if (usuario) {
      res.status(200).json({ usuario, message: 'Coluna atualizada com sucesso!' });
    } else {
      res.status(404).json({ message: 'Coluna não encontrada' });
    }
  } catch (error) {
    console.error('Erro ao atualizar coluna:', error);
    res.status(500).json({ message: 'Erro ao atualizar coluna' });
  }
});

// Rota para atualizar o título da coluna
app.put('/atualizar-coluna/:usuarioId/:colunaId', async (req, res) => {
  const usuarioId = req.params.usuarioId;
  const colunaId = req.params.colunaId;
  const novoTitulo = req.body.novoTitulo;

  try {
      // Encontrar a coluna pelo ID
      const coluna = await Usuario.findOne({ _id: usuarioId, 'colunas._id': colunaId });

      if (!coluna) {
          return res.status(404).json({ message: 'Coluna não encontrada' });
      }

      // Atualizar o título da coluna
      coluna.colunas.id(colunaId).titulo = novoTitulo;

      // Salvar as alterações no banco de dados
      await coluna.save();

      res.status(200).json({ message: 'Título da coluna atualizado com sucesso' });
  } catch (error) {
      console.error('Erro ao atualizar título da coluna', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.delete('/remover-coluna/:usuarioId/:colunaId', async (req, res) => {
  const usuarioId = req.params.usuarioId;
  const colunaId = req.params.colunaId;

  try {
      // Encontrar o usuário e a coluna pelo ID
      const usuario = await Usuario.findOne({ _id: usuarioId, 'colunas._id': colunaId });

      if (!usuario) {
          return res.status(404).json({ message: 'Usuário ou coluna não encontrada' });
      }

      // Remover a coluna pelo ID dentro do usuário
      usuario.colunas.pull({ _id: colunaId });

      // Salvar as alterações no banco de dados
      await usuario.save();

      res.status(200).json({ message: 'Coluna removida com sucesso' });
  } catch (error) {
      console.error('Erro ao remover coluna', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

app.post('/adicionar-coluna/:usuarioId', async (req, res) => {
  const usuarioId = req.params.usuarioId;
  const { titulo } = req.body;

  try {
    // Encontrar o usuário pelo ID
    const usuario = await Usuario.findOne({ _id: usuarioId });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Adicionar a nova coluna
    const novaColuna = {
      titulo: titulo,
      ordem: usuario.colunas.length + 1,
      tarefas: [],
    };

    usuario.colunas.push(novaColuna);

    // Salvar as alterações no banco de dados e obter o _id retornado pelo save
    const usuarioAtualizado = await usuario.save();

    const novaColunaComId = usuarioAtualizado.colunas[usuarioAtualizado.colunas.length - 1];

    res.status(200).json({ message: 'Coluna adicionada com sucesso', novaColuna: novaColunaComId });
  } catch (error) {
    console.error('Erro ao adicionar coluna', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});