
<section class="quadro">
    <h1>Quadro Kanban</h1>
    <div class="colunas">
        {#each $quadroShared as coluna ("coluna"+coluna.id) }
            <Coluna bind:colunaProps={coluna} on:removerColuna={argumento => handleRemoverColuna(argumento.detail)}></Coluna>
        {/each}

        <div class="espacoNovaColuna">
            {#if criarColuna}
                <div class="formAdicionarColuna">
                    <input bind:value={tituloNovaColuna} type="text" placeholder="Criar Nova Coluna" autofocus on:keydown={checarEnter}/>
                    <div class="rodapeAdicionarColuna">
                        <button type="button" on:click={adicionarColuna}>Adicionar Coluna</button>
                        <p on:click={desabilitarNovaColuna}>X</p>
                    </div>

                </div>       
            {:else}
                <div class="novaColuna" on:click={habilitarNovaColuna}><p class="novaColunaSimbolo">+</p><p class="novaColunaTexto">Adicionar uma Coluna</p></div>
            {/if}
        </div>

    </div>

</section>

<script lang="ts">
    import Coluna from "./Coluna.svelte"
    import {type ColunaT} from "../model"
    import {setContext} from "svelte"
    import { writable} from "svelte/store"
    import { getContext } from "svelte";
    import {type Writable} from "svelte/store"

    let idUsuarioShared = getContext<Writable<String>>('idUsuarioShared')
    const API_URL = "http://localhost:3000/";


    export let quadroProps: ColunaT[]

    $: items = quadroProps

    let quadroShared = writable(quadroProps.sort(function(a, b){return a.ordem-b.ordem}))
    setContext('sharedQuadro', quadroShared)

    let criarColuna = false
    let tituloNovaColuna = ""

    function habilitarNovaColuna(){
        criarColuna= true;
        tituloNovaColuna = ""
    }

    function desabilitarNovaColuna(){
        criarColuna = false;
        tituloNovaColuna = ""
    }

    function adicionarColuna(){
        if(tituloNovaColuna.trim() == ""){
            return
        }
        let quantidadeColunas = $quadroShared.length
        let novaLista = [...$quadroShared]
        
        console.log("tentando adicionar coluna,", tituloNovaColuna.trim())
        fetch(API_URL+`adicionar-coluna/${$idUsuarioShared}`,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify( {titulo: tituloNovaColuna.trim()} )
        }).then(res => {
            if (!res.ok) {
                console.log("Erro ao adicionar coluna");
            }
            return res.json();
        }).then(dados =>{
            console.log(dados.message);

            const novaColuna:ColunaT = {
                titulo:dados.novaColuna.titulo,
                ordem: dados.novaColuna.ordem,
                tarefas: [],
                id: dados.novaColuna._id,
            }

            novaLista.push(novaColuna)
            $quadroShared = [...novaLista]
            desabilitarNovaColuna();

        }); 

    }

    function checarEnter(evento: KeyboardEvent){
        if(evento.key != "Enter"){
            return
        }
        adicionarColuna()
    }

    function handleRemoverColuna(coluna: ColunaT){
        let novaLista = [...$quadroShared]
        //Ajusta a ordem das colunas seguintes à removida
        let indiceRemovido:number = novaLista.findIndex((elemento  => elemento.id == coluna.id))
        novaLista.forEach((elemento, indice) => {
            if(indice>=indiceRemovido){
                elemento.ordem -=1 
            }
        })

        //Remove o elemento
        novaLista = novaLista.filter((elemento) => elemento.id !== coluna.id)
        //Atribuição para o svelte conhecer a alteração e renderizar novamente
        $quadroShared = [...novaLista]

        fetch(API_URL+`remover-coluna/${$idUsuarioShared}/${coluna.id}`,{
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
        }).then(res => {
            if (!res.ok) {
                console.log("Erro ao remover coluna");
            }
            return res.json();
        }).then(dados =>{
            console.log(dados.message);
        }); 
    }

    function handleDndConsider(e){
        quadroProps = e.detail.items;
    }
    function handleDndFinalize(e){
        quadroProps = e.detail.items;
    }

</script>

<style>
    h1{
        color: white;
        font-size: 2.4rem;
    }
    .colunas{
        display: flex;
        align-items: flex-start;
     
    }

    .quadro{
        background-color: #ba9efd;
        padding: 20px;
    }
    
    .espacoNovaColuna{
        width:300px;
        min-width: 300px;
    }

    .novaColuna{
        padding: 10px 25px 10px 15px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background-color: rgba(150, 109, 245, 0.855);
        border-radius: 8px;
        color: white;
    }

    .novaColuna:hover{
        background-color: rgba(165, 129, 247, 0.712);
        cursor: pointer; 
    }

    .novaColuna p{
        margin:0;
        padding:0;
    }

    .novaColunaTexto {
        line-height:25px;
    }

    .novaColunaSimbolo{      
        font-size: 2rem;
        line-height:20px;
    }

    .formAdicionarColuna{
        border-radius: 8px;
        background-color: rgb(241,242,244);
        padding:10px;
    }

    input{
        width: 100%;
        font-size: 1rem;
        padding: 5px;
        margin-top: 10px;
    }

    .rodapeAdicionarColuna{
        display: flex;
        gap: 15px;
        margin: 15px 0 10px;
    }

    .rodapeAdicionarColuna p{
        font-weight: bolder;
        padding: 10px;
        margin:0;

    }

    .rodapeAdicionarColuna p:hover{
        background-color: rgb(206, 208, 211);
        border-radius: 5px;
        cursor: pointer;
    }

    .rodapeAdicionarColuna button{
        background-color:#2a7bec;
        padding: 0px 10px;
        color: white;
        line-height: normal;
    }

    .rodapeAdicionarColuna button:hover{
        background-color:#0C66E4;
    }

</style>
