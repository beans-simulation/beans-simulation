class Infos {
    constructor(){
        this.populacao = [];
        this.velocidade = [];
        this.agilidade = [];
        this.raio = [];
        this.deteccao = [];
        this.energia = [];
        this.gasto = [];
        this.tamanho_medio_ninhada = [];
    }

    clear() {
        this.populacao.length = []
        this.velocidade.length = []
        this.agilidade.length = []
        this.raio.length = []
        this.deteccao.length = []
        this.energia.length = []
        this.gasto.length = []
        this.tamanho_medio_ninhada.length = [];
    }
}