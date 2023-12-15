<section class="coluna">
    <header>
        <textarea rows="1" bind:this={ref} bind:value={colunaProps.titulo} 
        on:keyup={checarEnterColuna} on:focusout={atualizarTitulo}
        ></textarea>
        <img class="lixeira" src="./imagens/lixeira.png" on:click={removerColuna}>

    </header>
    
    <div class="tarefas" use:dndzone="{{items, dragDisabled:dragDesabilitado}}" on:consider="{handleDndConsider}" on:finalize="{handleDndFinalize}">
    {#each colunaProps.tarefas as tarefa ("tarefa"+tarefa.id) }
        <Tarefa bind:tarefaProps={tarefa} 
        on:atualizarDD={argumento => handleAtualizarDD(argumento.detail)} 
        on:removerTarefa={argumento => handleRemoverTarefa(argumento.detail)}>
        </Tarefa>
    {/each}
    </div>

    {#if criarTarefa}
        <textarea bind:value={tituloNovaTarefa} placeholder="Criar Nova tarefa" autofocus 
        on:keydown={checarEnterTarefa}></textarea>

        <div class="rodapeAdicionarTarefa">
            <button type="button" on:click={adicionarTarefa}>Adicionar Tarefa</button>
            <p on:click={desabilitarNovaTarefa}>X</p>
        </div>
        
    {:else}
        <div class="novaTarefa" on:click={habilitarNovaTarefa}><p class="novaTarefaSimbolo">+</p><p class="novaTarefaTexto">Adicionar uma tarefa</p></div>
    {/if}
    
</section>

<script lang="ts">

    export let colunaProps: ColunaT

    import Tarefa from "./Tarefa.svelte"
    import {type TarefaT} from "../model"
    import { createEventDispatcher } from "svelte";
    import { getContext } from "svelte";
    import {type Writable} from "svelte/store"
    import {type ColunaT} from "../model"
    import {dndzone} from "svelte-dnd-action"
    
    //controla se o drag and drop estará habilitado ou não
    let dragDesabilitado = false
    
    //referenciar o elemento do título
    let ref

    //controla se o campo para inserir nova tarefa estará visível ou não
    let criarTarefa = false

    let tituloNovaTarefa = ""
    const dispatch = createEventDispatcher()
    let quadroShared = getContext<Writable<ColunaT[]>>('sharedQuadro')
    let idUsuarioShared = getContext<Writable<String>>('idUsuarioShared')
    const API_URL = "http://localhost:3000/";

    let tituloAntigo = colunaProps.titulo;


    $: items = colunaProps.tarefas

    function atualizarTitulo(){

        colunaProps.titulo = colunaProps.titulo.trim();
        if(colunaProps.titulo === "" && colunaProps.titulo !== tituloAntigo ){
            colunaProps.titulo = tituloAntigo;
        }else if (colunaProps.titulo !== ""  && colunaProps.titulo !== tituloAntigo){
            tituloAntigo = colunaProps.titulo;
            
            fetch(API_URL+`atualizar-coluna/${$idUsuarioShared}/${colunaProps.id}`,{
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify( {novoTitulo: colunaProps.titulo} )
            }).then(res => {
                if (!res.ok) {
                    console.log("Erro ao atualizar coluna");
                }
                return res.json();
            }).then(dados =>{
                console.log(dados.message);
            }); 
        }

    }


    function habilitarNovaTarefa(){
        criarTarefa = true;
        tituloNovaTarefa = ""
    }

    function desabilitarNovaTarefa(){
        criarTarefa = false;
        tituloNovaTarefa = ""
    }

    function adicionarTarefa(){
        if(tituloNovaTarefa.trim() == ""){
            return
        }
        
        let novaLista = [...$quadroShared]
        
        let indiceColunaAtual:number = novaLista.findIndex((elemento  => elemento.id == colunaProps.id))
        let quantidadeTarefasColunaAtual = novaLista[indiceColunaAtual].tarefas.length

        console.log("ao tentar adicionar uma tarefa");

        console.log("id da coluna do props", colunaProps.id);
        console.log("coluna do props", colunaProps);
        console.log("indice coluna atual", indiceColunaAtual);
        console.log(" coluna indice coluna atual", novaLista[indiceColunaAtual]);


        fetch(API_URL+"adicionar-tarefa",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ userId:$idUsuarioShared, colunaId:colunaProps.id, tarefa:
            {
                titulo:tituloNovaTarefa,
                ordem:quantidadeTarefasColunaAtual+1,
                descricao: "",
            } })
        }).then(res => {
            if (!res.ok) {
                console.log("Erro ao adicionar tarefa");
            }
            return res.json();
        }).then(dados =>{
            console.log(dados.message);

            const novaTarefa:TarefaT = {
                titulo:dados.novaTarefa.titulo,
                ordem: dados.novaTarefa.ordem,
                descricao: "",
                id: dados.novaTarefa._id,
                colunaId: colunaProps.id
            }          
            novaLista[indiceColunaAtual].tarefas.push(novaTarefa)
            $quadroShared = [...novaLista]
            desabilitarNovaTarefa()

        });

    }

    function removerColuna(){
        dispatch('removerColuna',colunaProps)
    }

    //Desabilita o drag and drop se o modal da tarefa estiver visível
    function handleAtualizarDD(argumento: {dragDesabilitado:boolean}){
        if(argumento.dragDesabilitado){
            dragDesabilitado = true
        }else{
            dragDesabilitado = false
        }

    }

    function handleRemoverTarefa(tarefa: TarefaT){

        let novaLista = [...$quadroShared]
        
        //Ajusta a ordem das tarefas seguintes à removida
        let indiceColunaAtual:number = novaLista.findIndex((elemento  => elemento.id == colunaProps.id))
        let indiceTarefaRemovida:number = novaLista[indiceColunaAtual].tarefas.findIndex(elemento => elemento.id == tarefa.id)
        novaLista[indiceColunaAtual].tarefas.forEach((elemento, indice) => {
            if(indice>=indiceTarefaRemovida){
                elemento.ordem -=1 
            }
        })

        novaLista[indiceColunaAtual].tarefas = novaLista[indiceColunaAtual].tarefas.filter((elemento) => elemento.id !== tarefa.id)
        $quadroShared = [...novaLista]

        let tarefasParaPersistir = [...novaLista[indiceColunaAtual].tarefas]
        tarefasParaPersistir.forEach(elemento => {
            delete elemento.colunaId;
        });
       

        fetch(API_URL+`atualizar-tarefas-coluna/${$idUsuarioShared}/${colunaProps.id}`,{
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify( {tarefas: tarefasParaPersistir})
        }).then(res => {
            if (!res.ok) {
                console.log("Erro ao adicionar tarefa");
            }
            return res.json();
        }).then(dados =>{
            console.log(dados.message);
        });  

    }

    //Verificar se foi digitado enter na nota tarefa
    function checarEnterTarefa(evento: KeyboardEvent){
        if(evento.key != "Enter"){
            return
        }
        adicionarTarefa()
    }

    function checarEnterColuna(evento: KeyboardEvent){
        if(evento.key == "Enter"){
            ref.blur()
        } else{
            ajustarAlturaTextarea()
        }    
        
    }

    function ajustarAlturaTextarea() {
        ref.style.height = 'auto';
        ref.style.height = ref.scrollHeight + 'px';
    }

    function handleDndConsider(e){
        colunaProps.tarefas = e.detail.items;
    }

    function handleDndFinalize(e){
        colunaProps.tarefas = e.detail.items;

        let novaLista = [...$quadroShared]
        
        let indiceColunaAtual:number = novaLista.findIndex((elemento  => elemento.id == colunaProps.id))
        let indiceTarefaAtual:number = novaLista[indiceColunaAtual].tarefas.findIndex((elemento  => elemento.id == e.detail.info.id))

        let indiceColunaAntiga: number = 0;
        
        //Encontrou a tarefa na lista atual, atualiza a ordem da coluna antiga
        if(indiceTarefaAtual != -1){
            indiceColunaAntiga = novaLista.findIndex((elemento  => elemento.id == novaLista[indiceColunaAtual].tarefas[indiceTarefaAtual].colunaId))
            novaLista[indiceColunaAntiga].tarefas.forEach((elemento, indice) => {
                if(indice>=novaLista[indiceColunaAtual].tarefas[indiceTarefaAtual].ordem){
                    elemento.ordem -=1 
                }
            })

            novaLista[indiceColunaAtual].tarefas[indiceTarefaAtual].colunaId = novaLista[indiceColunaAtual].id
            novaLista[indiceColunaAtual].tarefas[indiceTarefaAtual].ordem = indiceTarefaAtual+1
        }
        
        $quadroShared = [...novaLista]

        let tarefasParaPersistirAtual = [...novaLista[indiceColunaAtual].tarefas]
        tarefasParaPersistirAtual.forEach(elemento => {
            delete elemento.colunaId;
        });

        let tarefasParaPersistirAntiga = [...novaLista[indiceColunaAntiga].tarefas]
        tarefasParaPersistirAntiga.forEach(elemento => {
            delete elemento.colunaId;
        });
       

        fetch(API_URL+`atualizar-tarefas-coluna/${$idUsuarioShared}/${novaLista[indiceColunaAtual].id}`,{
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify( { tarefas: tarefasParaPersistirAtual})
        }).then(res => {
            if (!res.ok) {
                console.log("Erro ao adicionar tarefa");
            }
            return res.json();
        }).then(dados =>{
            console.log(dados.message);
        }); 
        
        fetch(API_URL+`atualizar-tarefas-coluna/${$idUsuarioShared}/${novaLista[indiceColunaAntiga].id}`,{
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify( { tarefas: tarefasParaPersistirAntiga})
        }).then(res => {
            if (!res.ok) {
                console.log("Erro ao adicionar tarefa");
            }
            return res.json();
        }).then(dados =>{
            console.log(dados.message);
        });  
    }

</script>

<style>
    .coluna{
        background-color: rgb(241,242,244);
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        padding:10px;
        box-sizing: border-box;
        margin-right: 20px;
        width: 300px;
        min-width: 300px;
        margin-bottom: 50px;
    }

    .tarefas{
        min-height: 10px;    
        padding: 10px 0 30px; 
        max-height: 60vh;
        overflow: auto;
    }

    header textarea{
        font-size: 1rem;
        border:none;
        background-color: rgb(241,242,244);
        font-weight: 700;
        margin-top: 1rem;
        box-sizing: border-box;
        width: 80%;
        resize: none;
        overflow: hidden;
        padding: 5px;
        font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    }

    header textarea:focus{
        background-color: white;
        width: 80%;      
    }

    header{
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    header img{
        width: 26px;
        height: 26px;
    }

    header img:hover{
        cursor:pointer;
    }

    h1{
        font-size: 16px;
        color:rgb(53, 51, 51);
    }

    .novaTarefa{
        padding: 10px 0;
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

    .novaTarefa p{
        margin:0;
        padding:0;
    }

    .novaTarefa:hover{
        background-color: rgb(206, 208, 211);
        border-radius: 5px;
        cursor: pointer;
    }

    .novaTarefaTexto {
        line-height:25px;
    }

    .novaTarefaSimbolo{      
        font-size: 2rem;
        line-height:20px;
    }

    textarea{
        font-size: 1rem;
    }

    .rodapeAdicionarTarefa{
        display: flex;
        gap: 15px;
        margin: 15px 0 10px;
    }

    .rodapeAdicionarTarefa p{
        font-weight: bolder;
        padding: 10px;
        margin:0;

    }

    .rodapeAdicionarTarefa p:hover{
        background-color: rgb(206, 208, 211);
        border-radius: 5px;
    }

    .rodapeAdicionarTarefa button{
        background-color:#2a7bec;
        padding: 0px 10px;
        color: white;
        line-height: normal;
    }

    .rodapeAdicionarTarefa button:hover{
        background-color:#0C66E4;
    }


</style>