<main>
  {#if !logado}
    <Login on:loginEfetuado={dados => exibirQuadro(dados.detail)} />
  {:else}
    <Quadro quadroProps={colunas}/>
  {/if}
</main>

<script lang="ts">
  import Quadro from "./componentes/Quadro.svelte";
  import Login from "./componentes/Login.svelte";
  import {type ColunaT} from "./model";
  import {type Writable} from "svelte/store"
  import {setContext} from "svelte";
  import {writable} from "svelte/store";
  let colunas: ColunaT[] = [];
  let logado = false;

  let idUsuarioShared = writable("_");
  let idUsuarioEmailShared = writable("_");
  let idUsuarioSenhaShared = writable("_");
  setContext('idUsuarioShared', idUsuarioShared);
  setContext('idUsuarioSenhaShared', idUsuarioSenhaShared);
  setContext('idUsuarioEmailShared', idUsuarioEmailShared);

  function exibirQuadro(usuario:any) {

    $idUsuarioShared = usuario._id;
    $idUsuarioEmailShared = usuario.email;
    $idUsuarioSenhaShared = usuario.senha;
    usuario.colunas.forEach((coluna: any) =>{
      let tarefas: any[] = [];
      coluna.tarefas.forEach(tarefa =>{
  
        const temp = {id: tarefa._id.toString(), titulo: tarefa.titulo, ordem: tarefa.ordem, colunaId:coluna._id.toString(), descricao: tarefa.descricao?tarefa.descricao:""};
        tarefas.push(temp);
      })
      let col: ColunaT ={
        id: coluna._id.toString(),
        titulo: coluna.titulo,
        ordem: coluna.ordem,
        tarefas: tarefas,
      }
      colunas.push(col);
    })
    logado = true;

  }


/*
  let coluna1: ColunaT = {
    id: "1",
    titulo: "Concluídas",
    ordem: 3,
    tarefas: [
      { id: "1", titulo: "Tarefa 1 da coluna 1", colunaId: "1", ordem: 1 },
      { id: "2", titulo: "Tarefa 2 da coluna 1", colunaId: "1", ordem: 2 },
      { id: "3", titulo: "Tarefa 3 da coluna 1", colunaId: "1", ordem: 3 },
    ],
  };

  let coluna2: ColunaT = {
    id: "2",
    titulo: "Em andamento",
    ordem: 2,
    tarefas: [
      { id: "4", titulo: "Tarefa 1 da coluna 2", colunaId: "2", ordem: 1 },
      { id: "5", titulo: "Tarefa 2 da coluna 2", colunaId: "2", ordem: 2 },
    ],
  };

  let coluna3: ColunaT = {
    id: "3",
    titulo: "Fazer",
    ordem: 1,
    tarefas: [],
  };
  
  let colunas: ColunaT[] = [coluna1, coluna2, coluna3];
  */

</script>

<style>
</style>
