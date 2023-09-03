//if(innerWidth<=425){
var tela ={width: innerWidth, height: innerHeight - 8}
//}else{
    //var tela = {width: innerWidth - 500, height: innerHeight - 8}
//}
const canvas = document.querySelector("canvas");
canvas.width = tela.width;
canvas.height = tela.height;

const c = canvas.getContext('2d');

var tamanhoUniverso = 1;

var universoWidth = canvas.width * tamanhoUniverso; 
var universoHeight = canvas.height * tamanhoUniverso; 

var fome_c = 0.8; // porcentagem da energia máxima acima da qual eles não comerão
var fome_h = 0.8; // porcentagem da energia máxima acima da qual eles não comerão

var mudarGrafico = false;

// Variáveis para o gráfico (carnívoro)
var popC;
var velMedC;
var forcaMedC;
var raioMedC;
var raioDetMedC;
var energMedC;
var taxaEnergMedC;

// Variáveis para alterações nas mutações
var probabilidade_mutacao = labelProb; // chances de cada gene (atributo) sofrer mutação
var magnitude_mutacao = 0.1; // magnitude da mutação (o quanto vai variar)

var lado_direito_vazio = true;
var lado_esquerdo_vazio = true;

// QuadTree
let retanguloCanvas = new Retangulo(universoWidth/2, universoHeight/2, universoWidth/2, universoHeight/2);

var popover_id = 1;

// Configuracoes dos organisms editados
var conf_c;
var conf_h;



// ---------------------------------------------------------------------------------------
//                                  FUNÇÕES
// ---------------------------------------------------------------------------------------

function criaUniverso(tamanhoUniverso){
    universoWidth = canvas.width * tamanhoUniverso; 
    universoHeight = canvas.height * tamanhoUniverso;
}

function verificaViesMutacoes(valor, iteracoes){
    var menor = 0;
    var maior = 0;
    var igual = 0;
    var novoValor = 0;
    for(var i = 0; i < iteracoes; i++){
        novoValor = newMutacao(valor)
        if(novoValor > valor){
            maior++;
        } else if(novoValor < valor){
            menor++;
        } else{
            igual++;
        }
    }

    console.log("Maior: " + ((maior * 100)/iteracoes) + "%")
    console.log("Menor: " + ((menor * 100)/iteracoes) + "%")
    console.log("Igual: " + ((igual * 100)/iteracoes) + "%")
    console.log("Mutações: " + (((maior + menor) * 100)/iteracoes) + "%")
}

function verificaViesMutacoesNinhada(ninhada_min, ninhada_max, iteracoes){
    var menor = 0;
    var maior = 0;
    var igual = 0;
    var ninhada_media = (ninhada_min + ninhada_max) / 2;
    for(var i = 0; i < iteracoes; i++){
        novoIntervalo = mutacaoNinhada(ninhada_min, ninhada_max)
        nova_ninhada_media = (novoIntervalo[0] + novoIntervalo[1]) / 2
        if(nova_ninhada_media > ninhada_media){
            maior++;
        } else if(nova_ninhada_media < ninhada_media){
            menor++;
        } else{
            igual++;
        }
    }

    console.log("Maior: " + ((maior * 100)/iteracoes) + "%")
    console.log("Menor: " + ((menor * 100)/iteracoes) + "%")
    console.log("Igual: " + ((igual * 100)/iteracoes) + "%")
    console.log("Mutações: " + (((maior + menor) * 100)/iteracoes) + "%")
}

// Função para não haver a necessidade de dar despausa() e pausa() quando é preciso redesenhar os elementos sem dar play em animate()
function desenhaTudo(){
    Alimento.alimentos.forEach(a => {
        a.display();
    })
    Organism.organisms.forEach(o => {
        o.display();
    })
}


function criaObjetos(n_organisms, n_alimentos){
    for(var i = 0; i < n_organisms; i++){
        var x =(Math.random() * (universoWidth - 50) + 25);
        var y = (Math.random() * (universoHeight - 50) + 25);
        geraOrganism(x,y);
    }

    for(var i = 0; i < n_alimentos; i++){
        var x =(Math.random() * (universoWidth - 50) + 25);
        var y = (Math.random() * (universoHeight - 50) + 25);
        geraAlimento(x,y);
    }
}

function destroiObjetos(){
    Organism.organisms.length = 0;
    Alimento.alimentos.length = 0;
    // mudaIntervaloAlimentos(1001);
}


// cria mais alimentos ao longo do tempo
// a função setInterval() permite que ele chame o loop a cada x milisegundos
var intervaloTaxaAlimentos;

// variáveis de auxílio para a implementação da divisão de tela
var limitador_de_loop = 0;

function geraAlimento(x,y){
    var raio = geraNumeroPorIntervalo(1, 2);
    return new Alimento(x, y, raio);
}

function geraOrganism(x,y){ // função para poder adicionar mais carnívoros manualmente 
    var raio_inicial = geraNumeroPorIntervalo(3, 8);
    var vel_max = geraNumeroPorIntervalo(1, 2.2); 
    var forca_max = geraNumeroPorIntervalo(0.01, 0.05);
    var cor = geraCor();
    var raio_deteccao_inicial = geraNumeroPorIntervalo(40, 120);
    var ninhada_min = geraInteiro(1, 1);
    var ninhada_max = ninhada_min + geraInteiro(1, 8);
    var intervalo_ninhada = [ninhada_min, ninhada_max];
    var sexo;

    if(Math.random() < 0.5){
        sexo = 'XX'
    } else{
        sexo = 'XY'
    }

    if(conf_c) {
        raio_inicial = conf_c.raio_inicial;
        vel_max = conf_c.vel_max;
        forca_max = conf_c.forca_max;
        cor = conf_c.cor;
        intervalo_ninhada = conf_c.intervalo_ninhada
        sexo = conf_c.sexo
    }

    var dna = new DNA(
        raio_inicial,
        vel_max,
        forca_max,
        cor,
        raio_deteccao_inicial,
        intervalo_ninhada,
        sexo
    )

    return new Organism(
        x, y, dna
    );
}

function geraCor(){
    // variáveis para a geração de cores
    var r = Math.floor(Math.random() * 256); 
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var cor = "rgb(" + r + "," + g + "," + b + ")";

    return cor;
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        "rgb("
        + parseInt(result[1], 16) + ","
        + parseInt(result[2], 16) + ","
        + parseInt(result[3], 16)
        + ")"
    : null;
}

function rgbToHex(rgb) {
    let result = /^rgb\(([\d]{1,3}),([\d]{1,3}),([\d]{1,3})\)$/i.exec(rgb)
    if(!result) return null;

    let r = parseInt(result[1]).toString(16)
    let g = parseInt(result[2]).toString(16)
    let b = parseInt(result[3]).toString(16)
    
    return `#${r.length<2? "0"+r:r}${g.length<2? "0"+g:g}${b.length<2? "0"+b:b}`
}

function corMutacao(estilo) {
    if(Math.random() < probabilidade_mutacao){ // Quanto menor for probabilidade_mutacao, menor será a chance da mutação ocorrer
        let cores = estilo.substring(4, estilo.length - 1) // remover os caracteres de texto. ex: "rgb(256,20,40)"
            .split(',') // retornar um array com os elementos separados por virgula. ex: 256,20,40
            .map(function(cor) { //pegar cada elemento do array e fazer os cálculos a seguir
                cor = parseInt(cor);
                let operacao = "";
                let p = Math.random();

                if(cor <= 10) { //para não gerar números negativos
                    operacao = "adicao"
                } else if(cor >= 246) { //para não gerar valores maiores que 256
                    operacao = "subtracao"

                } else { //randomiza se vai ser add ou subtraido valores caso a cor estiver entre 10 e 246
                    if(Math.random() < 0.5) {
                        operacao = "adicao"
                    } else {
                        operacao = "subtracao"
                    }
                }

                if(operacao == "adicao") {
                    if(p < 0.002){ // Há 0.2% de chance de a mutação ser grande
                        return Math.ceil(cor + cor * (Math.random() * magnitude_mutacao * 10));
                    } else if(p < 0.008){ // Há 0.6% de chance (0.8% - o 0.2% do if anterior) de a mutação ser razoavelmente grande
                        return Math.ceil(cor + cor * (Math.random() * magnitude_mutacao * 4));
                    } else if(p < 0.028){ // Há 2% de chance (2.8% - o 0.8% do if anterior) de a mutação ser razoável
                        return Math.ceil(cor + cor * (Math.random() * magnitude_mutacao * 2));
                    } else{
                        // return cor + Math.ceil(Math.random() * 10)
                        return Math.ceil(cor + cor * (Math.random() * magnitude_mutacao));
                    }
                    
                } else { //subtração
                    if(p < 0.002){ // Há 0.2% de chance de a mutação ser grande
                        return Math.ceil(cor - cor * (Math.random() * magnitude_mutacao * 10));
                    } else if(p < 0.008){ // Há 0.6% de chance (0.8% - o 0.2% do if anterior) de a mutação ser razoavelmente grande
                        return Math.ceil(cor - cor * (Math.random() * magnitude_mutacao * 4));
                    } else if(p < 0.028){ // Há 2% de chance (2.8% - o 0.8% do if anterior) de a mutação ser razoável
                        return Math.ceil(cor - cor * (Math.random() * magnitude_mutacao * 2));
                    } else{
                        return Math.ceil(cor - cor * (Math.random() * magnitude_mutacao));
                    }
                }
            });
        
        // console.log("MUTAÇÃO DE COR");
        return `rgb(${cores[0]},${cores[1]},${cores[2]})`
    } else{
        return estilo;
    }
}

function newMutacao(valor) {// exemplo: valor = 20;  magnitude_mutacao = 0.05 || 5%
    if(Math.random() < probabilidade_mutacao){ // Quanto menor for probabilidade_mutacao, menor será a chance da mutação ocorrer
        let p = Math.random();
        let variacao = valor * magnitude_mutacao; //  variacao = 20 * 0.05 = 1, ou seja, poderá variar de +1 a -1 no resultado
        if(p < 0.001){ // Há 0.1% de chance de a mutação ser bem grande
            variacao *= 10;
        } else if(p < 0.003){ // Há 0.2% de chance (0.3% - 0.1% do if anterior) de a mutação ser grande
            variacao *= 6;
        } else if(p < 0.008){ /// Há 0.5% de chance (0.8% - o 0.3% do if anterior) de a mutação ser razoavelmente grande
            variacao *= 3.5;
        } else if(p < 0.028){ // Há 2% de chance (2.8% - o 0.8% do if anterior) de a mutação ser razoável
            variacao *= 2;
        }
        
        let minimo = valor - variacao;  //  minimo = 20 - 1 = 19. Para que não precise sub-dividir o return em adição ou subtração
        variacao *= 2                   //  puxo o ponto de referência para o menor valor possível. Logo, o resultado variará de
                                        //  0 a +2, afinal a distância de 1 até -1 é 2.
        if(minimo <= 0) {
            minimo = valor * 0.01; // Se a mutação diminuir o valor para menos que 0, ela será simplesmente muito pequena
        }
        // console.log("MUTAÇÃO");
        return minimo + Math.random() * variacao; // 19 + Math.randon() * 2. O resultado estará entre o intervalo [19, 21]
    } else{ // Caso não ocorra mutação, retorna o valor original
        return valor;
    }
}

function mutacaoNinhada(ninhada_min, ninhada_max) {
    if(Math.random() < probabilidade_mutacao){ // Quanto menor for probabilidade_mutacao, menor será a chance da mutação ocorrer
        let variacao_ninhada_min = geraInteiro(0, 2 + Math.floor(magnitude_mutacao * 10));
        let variacao_ninhada_max = geraInteiro(0, 2 + Math.floor(magnitude_mutacao * 10));
 
        if(Math.random() >= 0.5) { // Soma
            ninhada_min += variacao_ninhada_min;
            ninhada_max += variacao_ninhada_max;
        } else{ // Subtrai
            ninhada_min -= variacao_ninhada_min;
            ninhada_max -= variacao_ninhada_max;
        }

        if(ninhada_min <= 0) {
            ninhada_min = 0;
        }
        if(ninhada_max <= ninhada_min) {
            ninhada_max = ninhada_min + 1;
        }
    }
    
    return [ninhada_min, ninhada_max];
}



function geraNumeroPorIntervalo(min, max) {
    let delta = max - min; // exemplo: 4000 e 6000. 6000 - 4000 = 2000
    return parseFloat((Math.random() * delta + min).toFixed(4)); // Math.random() * 2000 + 4000
}

function criaAlimentosGradativo(){
    if(!pausado){ // Para de criar alimentos enquanto a simulação estiver pausada
        var x = Math.random() * (universoWidth - 62) + 31;
        var y = Math.random() * (universoHeight - 62) + 31;
        var raio = Math.random() * 1.5 + 1;

        if(Alimento.alimentos.length < 3000){ // Limitador para não sobrecarregar a simulação
            new Alimento(x, y, raio);
        }
        
    }
}

function mudaIntervaloAlimentos(novoValor, criar=false) {
    novoTempo = 1000 / novoValor
    if(!criar) {
        clearInterval(intervaloTaxaAlimentos);
    }
    if(novoTempo > 1000) return;
    if(antesDoPlay) return;
    intervaloTaxaAlimentos = setInterval(criaAlimentosGradativo, novoTempo)
}

function mudaProbMutacao(novoValor){
    probabilidade_mutacao = novoValor / 100;
}

function mudaMagMutacao(novoValor){
    magnitude_mutacao = novoValor / 100;
}


function desenhaQuadTree(qtree){
    qtree.desenha();

    let alcance = new Retangulo(Math.random() * universoWidth, Math.random() * universoHeight, 170, 123);
    c.rect(alcance.x - alcance.w, alcance.y - alcance.h, alcance.w*2, alcance.h*2);
    c.strokeStyle = "green";
    c.lineWidth = 3;
    c.stroke();

    let pontos = qtree.procura(alcance);
    for(let p of pontos){
        c.beginPath();
        c.arc(p.x, p.y, 1, 0, 2 * Math.PI);
        c.strokeStyle = "red";
        c.stroke();
    }
}

function criaPontos(){
    let congregacao = new Ponto(Math.random() * universoWidth, Math.random() * universoHeight);
    
    for(var i = 0; i < 500; i++){
        let p = new Ponto(Math.random() * universoWidth, Math.random() * universoHeight);
        qtree.inserirPonto(p);
    }
    for(var i = 0; i < 300; i++){
        let p = new Ponto(congregacao.x + (Math.random() - 0.5) * 300, congregacao.y + (Math.random() - 0.5) * 300);
        qtree.inserirPonto(p);
    }
    for(var i = 0; i < 400; i++){
        let p = new Ponto(congregacao.x + (Math.random() - 0.5) * 600, congregacao.y + (Math.random() - 0.5) * 600);
        qtree.inserirPonto(p);
    }
    for(var i = 0; i < 400; i++){
        let p = new Ponto(congregacao.x + (Math.random() - 0.5) * 800, congregacao.y + (Math.random() - 0.5) * 800);
        qtree.inserirPonto(p);
    }
}


var idAnimate;

function pausa(){
    pausado = true;

    btnPausa.classList.add("d-none");
    btnDespausa.classList.remove("d-none");

}

function despausa(){
    pausado = false;

    btnDespausa.classList.add("d-none");
    btnPausa.classList.remove("d-none");

    animate();
}

function acelera(){
    animate();

    // btnDesacelera.classList.remove("d-none");
}

function desacelera(){
    pausa();
    setTimeout(despausa, 10);
}

function animate(){
    if(pausado == false){
        idAnimate = requestAnimationFrame(animate);
    }
    
    c.clearRect(0, 0, universoWidth, universoHeight);
    c.beginPath();
    c.moveTo(-3, -4);
    c.lineTo(universoWidth + 3, -3);
    c.lineTo(universoWidth + 3, universoHeight + 3);
    c.lineTo(-3, universoHeight + 3);
    c.lineTo(-3, -3);
    c.strokeStyle = "white";
    c.stroke();

    // Criando a Quadtree
    let qtree = new QuadTree(retanguloCanvas, 10);


    // limitador_de_loop = 0;

    Alimento.alimentos.forEach(alimento => {
        alimento.display();
        qtree.inserirAlimento(alimento); // Insere o alimento na QuadTree

    })

    Organism.organisms.forEach((organism) => {
        organism.criaBordas(false); // telaDividida: false
    })

    Organism.organisms.forEach(organism => {
        qtree.insertOrganism(organism); // Insere o organism na QuadTree
    });
    

    Organism.organisms.forEach(organism => {
        organism.update();
        organism.vagueia();

        // Transforma o raio de detecção em um objeto círculo para podermos manipulá-lo
        let visaoC = new Circulo(organism.posicao.x, organism.posicao.y, organism.raio_deteccao);

        // organism.buscarHerbivoro(qtree, visaoC);
        //julia: comentado momentaneamente enquanto nao existe comida
        // if(organism.energia <= organism.energia_max * fome_c){ // FOME
        //     organism.buscarHerbivoro(qtree, visaoC);
        // }
    })
}


function geraInteiro(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

// ----------------------------------------------------------------------------------------------
//                                         Cronômetro
// ----------------------------------------------------------------------------------------------
var cronometro;

function criaCronometro(){
    cronometro = setInterval(() => { timer(); }, 10);
}

function timer() {
    if(!pausado){ // Só atualiza se a simulação não estiver pausada
        if ((milisegundo += 10) == 1000) {
        milisegundo = 0;
        segundo++;
        segundos_totais++;
        }
        if (segundo == 60) {
        segundo = 0;
        minuto++;
        }
        if (minuto == 60) {
        minuto = 0;
        hora++;
        }
        document.getElementById('hora').innerText = returnData(hora);
        document.getElementById('minuto').innerText = returnData(minuto);
        document.getElementById('segundo').innerText = returnData(segundo);
        document.getElementById('milisegundo').innerText = returnData(milisegundo);
    }
}
  
function returnData(input) {
    return input > 10 ? input : `0${input}`
}

function resetaCronometro(){
    hora = minuto = segundo = milisegundo = segundos_totais = 0;

    //limpar o cronometro se ele existe.
    try {
        clearInterval(cronometro);
    } catch(e){}

    document.getElementById('hora').innerText = "00";
    document.getElementById('minuto').innerText = "00";
    document.getElementById('segundo').innerText = "00";
    document.getElementById('milisegundo').innerText = "00";
}

function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
   }
   return result;
}

// ----------------------------------------------------------------------------------------------
//                                         Frame rate
// ----------------------------------------------------------------------------------------------

// // The higher this value, the less the fps will reflect temporary variations
// // A value of 1 will only keep the last value
// var filterStrength = 20;
// var frameTime = 0, lastLoop = new Date, thisLoop;

// function gameLoop(){
//   // ...
//   var thisFrameTime = (thisLoop=new Date) - lastLoop;
//   frameTime+= (thisFrameTime - frameTime) / filterStrength;
//   lastLoop = thisLoop;
// }

// // Report the fps only every second, to only lightly affect measurements
// var fpsOut = document.getElementById('framerate');
// setInterval(function(){
//   fpsOut.innerHTML = parseFloat((1000/frameTime).toFixed(1)) + " fps";
// },500);

// // function calculaFrameRate(){
// //     var fps;
// //     var thisLoop = new Date();
// //     fps = 1000/(thisLoop - lastLoop);
// //     lastLoop = thisLoop;

// //     return fps;
// //     document.getElementById("framerate").innerHTML = fps;
// // }

// setInterval(() => {
//     var thisLoop = new Date();
//     var fps = 1000/(thisLoop - lastLoop);
//     lastLoop = thisLoop;

//     document.getElementById("framerate").innerHTML = fps;
// }, 1000);
