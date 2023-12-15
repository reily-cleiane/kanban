<div class="tarefa" on:click={() => exibirModal = true}>
    <span>{tarefaProps.titulo}</span>
</div>

{#if exibirModal}

    <TarefaDetalheModal bind:tarefa={tarefaProps} bind:exibirModal={exibirModal}
        on:removerTarefa={()=>dispatch('removerTarefa', tarefaProps)} 
        on:alterarTarefa={()=> handleAlterarTarefa()}>
    </TarefaDetalheModal>
 
{/if}

<script lang="ts">
    import {type TarefaT} from "../model"
    import TarefaDetalheModal from "./TarefaDetalheModal.svelte"
    import { createEventDispatcher } from "svelte";
    import { getContext } from "svelte";
    import {type Writable} from "svelte/store"

    export let tarefaProps: TarefaT
    let exibirModal = false
    const dispatch = createEventDispatcher()
    const API_URL = "http://localhost:3000/";
    let idUsuarioShared = getContext<Writable<String>>('idUsuarioShared')
    let tituloAntigo = tarefaProps.titulo;

    $: if(exibirModal){
        dispatch("atualizarDD",{dragDesabilitado:true})
    }else{
        dispatch("atualizarDD",{dragDesabilitado:false})
    }

    $: {
        if(tarefaProps.titulo === "" && exibirModal==false && tarefaProps.titulo !== tituloAntigo ){
            tarefaProps.titulo = tituloAntigo;
        }else if (tarefaProps.titulo !== "" && exibirModal==false && tarefaProps.titulo !== tituloAntigo){
            tituloAntigo = tarefaProps.titulo;
            handleAlterarTarefa();
        }

    }

    function handleAlterarTarefa(){

        fetch(API_URL+`atualizar-tarefa/${$idUsuarioShared}/${tarefaProps.colunaId}/${tarefaProps.id}`,{
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(
            {
                titulo:tarefaProps.titulo,
                ordem:tarefaProps.ordem,
                descricao: tarefaProps.descricao
            })
        }).then(res => {
            if (!res.ok) {
                console.log("Erro ao atualizar a tarefa");
            }
            return res.json();
        }).then(dados =>{
            console.log(dados.message);

        });
    }
        
</script>

<style>
    .tarefa{
        border: 1px solid #68676e63;
        border-radius: 5px;
        box-shadow: 0px 2px 4px #68676e63;
        padding: 10px;
        background-color: white;
        box-sizing: border-box;
        margin-bottom: 10px;
    }
</style>