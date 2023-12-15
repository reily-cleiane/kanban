<Modal bind:showModal={exibirModal} 
on:removerTarefa={()=> dispatch('removerTarefa')} on:alterarTarefa={()=> dispatch('alterarTarefa')} >
    <textarea rows="1" bind:this={ref} class="tituloTarefa" bind:value={tarefa.titulo} slot="header" required
    on:keyup={checarEnterTitulo}
    on:focus={ajustarAlturaTextarea}/>  
<!-- <input bind:value={tarefa.titulo} slot="header"/> -->

    <div class="conteudo">
        <h4>Descrição</h4>
        <textarea bind:value={tarefa.descricao}></textarea>
        <h4>Atribuído para</h4>
        <p>Fulano</p>
    </div>
    
</Modal>

<script lang="ts">
    import Modal from './modal/Modal.svelte'
    import {type TarefaT} from "../model"
    import { createEventDispatcher } from "svelte";
    export let exibirModal: boolean
    export let tarefa: TarefaT
    const dispatch = createEventDispatcher()
    let ref

    function checarEnterTitulo(evento: KeyboardEvent){
        if(evento.key == "Enter"){
            ref.blur()
        }
        ajustarAlturaTextarea()
        
    }

    function ajustarAlturaTextarea() {
        ref.style.height = 'auto';
        ref.style.height = ref.scrollHeight + 'px';
    }

</script>

<style>

    .tituloTarefa{
        font-weight: 600;
        font-size: 1.6rem;
        border:none;
        padding: 10px;
        resize: none;
        overflow: hidden;
        box-sizing: border-box;
        font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;

    }

    textarea{
        width: 100%;
    }

    .conteudo{
        padding: 10px 15px;
    }
    

</style>