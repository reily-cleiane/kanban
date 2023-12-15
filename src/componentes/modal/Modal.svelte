
<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<div on:click|stopPropagation>
		
		<div class="titulo">
			<slot name="header" />
			<span on:click={() => dialog.close()}>x</span>
			
		</div>	
		<slot />	
		
		<!-- svelte-ignore a11y-autofocus -->
		<div class="rodape">
			<button class="alterar" on:click={() =>  { dispatch('alterarTarefa'); dialog.close()}}>Salvar Alterações</button>
			<button class="remover" on:click={() => { dispatch('removerTarefa'); dialog.close()}}>Excluir tarefa</button>
		</div>

	</div>
</dialog>

<script>
	import { createEventDispatcher } from "svelte";
	export let showModal; // boolean

	let dialog; // HTMLDialogElement

	$: if (dialog && showModal) dialog.showModal();

	const dispatch = createEventDispatcher()
</script>

<style>
	dialog {
		width: 50%;
		min-width: 40%;
		max-width: 80vh;
		border-radius: 8px;
		border: none;
		padding: 0;
		min-height: 50vh;
		color:rgb(65, 61, 61);
	}
	
	.titulo{
		display: flex;
		gap: 2rem;
		padding: 10px 10px;
		justify-content: space-between;
		align-items:start;
		width: 100%;
		margin:0;
		border-bottom: 1px solid rgb(206, 208, 211);
	}

	.titulo span{
		padding: 10px 15px;
		font-size: 1.4rem;
		font-weight: 600;
	}

	.titulo span:hover{
		background-color: rgb(241,242,244);
		border-radius: 5px;
		cursor: pointer;

	}

	.rodape{
		border-top: 1px solid rgb(206, 208, 211);
		margin-top: 15px;
		padding: 10px 15px;
		display: flex;
		justify-content: end;
		gap: 5px;
	}


	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		/*padding: 1em;*/
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	.remover{
		display: block;
		background-color: rgb(235 79 39);
		color: white;
	}
	.alterar{
		background-color: #198754;
		color: white;
	}
</style>