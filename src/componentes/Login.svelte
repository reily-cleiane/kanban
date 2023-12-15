<div class="formulario">
    <h1>Quadro Kanban</h1>
    
    <form on:submit|preventDefault={handleEntrar}>
        <h2>Login</h2>
        <p>{erro}</p>

        <input type="email" bind:value={email} required placeholder="Informe o email"/>
        <br />

        <input type="password" bind:value={senha} required placeholder="Informe a senha"/>
      <br />
      <button type="submit">Entrar</button>
    </form>
</div>

<script lang="ts">

    import { createEventDispatcher } from "svelte";

    let email = "";
    let senha = "";
    let erro = "";
    const API_URL = "http://localhost:3000/";
    const dispatch = createEventDispatcher();

    function handleEntrar() {  
        erro = "";      
        fetch(API_URL+"login",{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, senha })
        }).then(res => {
            console.log("Código do Status:", res.status);
            if (!res.ok) {
                erro = "Erro: ";
            }
            return res.json();
        }).then(dados =>{
            if(erro){
                erro += dados.message;
            } else{
                dispatch('loginEfetuado',dados.usuario);
            }
        });
    }
  </script>
  
<style>

  
    .formulario {
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 60vh;
        background-color: #ba9efd;
        color: #fff;
        font-family: 'Arial', sans-serif;
        box-sizing: border-box;
    }

    p{
        color:red;
        font-size: 1rem;
    }

    h1{
        margin-bottom: 50px;
    }

    h2{
        margin-bottom: 40px;
        font-size: 1.4rem;
    }
  
    form {
      text-align: center;
      font-size: 1.6rem;
      border-radius: 10px;
      padding: 90px 30px;
      background-color: #7357b5;;
    }
  
    input {
        margin-bottom: 30px;
        padding: 10px;
        border: none;
        border-radius: 4px;
        width: 400px;
        height: 50px;
    }

    input::placeholder {
        font-size: 1rem; 
    }
  
    button {
        padding: 10px 20px;
        color: #fff; 
        background-color:  rgb(67, 46, 105);        
        margin: 30px 0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
    }
  
    button:hover {
        background-color: rgb(26, 17, 42);   
    }
  </style>
