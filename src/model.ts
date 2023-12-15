export interface TarefaT{
    id:string,
    titulo:string,
    colunaId:string,
    ordem:number,
    descricao?:string,
}

export interface ColunaT{
    id:string,
    titulo:string
    ordem:number
    tarefas: TarefaT[]
}