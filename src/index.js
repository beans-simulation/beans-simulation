//if(innerWidth<=425){
var tela ={width: innerWidth, height: innerHeight - 8}
//}else{
    //var tela = {width: innerWidth - 500, height: innerHeight - 8}
//}
const canvas = document.querySelector("canvas");
canvas.width = tela.width;
canvas.height = tela.height;

const c = canvas.getContext('2d');

var universe_size = 1;

var universe_width = canvas.width * universe_size; 
var universe_height = canvas.height * universe_size; 

var percentual_energy_to_eat = 0.8; // porcentagem da energia máxima acima da qual eles não comerão

var mudarGrafico = false;

// Variáveis para o gráfico (carnívoro)
var popC;
var velMedC;
var forceMedC;
var radiusMedC;
var radiusDetMedC;
var energMedC;
var taxaEnergMedC;

// Variáveis para alterações nas mutações
var probabilidade_mutacao = label_mutation_probability; // chances de cada gene (atributo) sofrer mutação
var magnitude_mutacao = 0.1; // magnitude da mutação (o quanto vai variar)

var lado_direito_vazio = true;
var lado_esquerdo_vazio = true;

// QuadTree
let retanguloCanvas = new Rectangle(universe_width/2, universe_height/2, universe_width/2, universe_height/2);

var popover_id = 1;

// Configuracoes dos organisms editados
var conf_c;
var conf_h;



// ---------------------------------------------------------------------------------------
//                                  FUNÇÕES
// ---------------------------------------------------------------------------------------

function create_universe(universe_size){
    universe_width = canvas.width * universe_size; 
    universe_height = canvas.height * universe_size;
}

function verificaViesMutacoes(valor, iteracoes){
    var menor = 0;
    var maior = 0;
    var igual = 0;
    var novoValor = 0;
    for(var i = 0; i < iteracoes; i++){
        novoValor = newMutation(valor)
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
    Vegetable.vegetables.forEach(a => {
        a.display();
    })
    Organism.organisms.forEach(o => {
        o.display();
    })
}


function create_objects(n_organisms, n_vegetables){
    for(var i = 0; i < n_organisms; i++){
        var x =(Math.random() * (universe_width - 50) + 25);
        var y = (Math.random() * (universe_height - 50) + 25);
        geraOrganism(x,y);
    }

    for(var i = 0; i < n_vegetables; i++){
        var x =(Math.random() * (universe_width - 50) + 25);
        var y = (Math.random() * (universe_height - 50) + 25);
        geraVegetable(x,y);
    }
}

function destroy_objects(){
    Organism.organisms.length = 0;
    Vegetable.vegetables.length = 0;
    // update_vegetables_apparition_interval(1001);
}


// cria mais vegetables ao longo do tempo
// a função setInterval() permite que ele chame o loop a cada x milisegundos
var intervaloTaxaVegetables;

// variáveis de auxílio para a implementação da divisão de tela
var limitador_de_loop = 0;

function geraVegetable(x,y){
    var radius = generate_number_per_interval(1, 2);
    return new Vegetable(x, y, radius);
}

function geraOrganism(x,y){ // função para poder adicionar mais carnívoros manualmente 
    var initial_radius = generate_number_per_interval(3, 8);
    var max_speed = generate_number_per_interval(1, 2.2); 
    var max_strength = generate_number_per_interval(0.01, 0.05);
    var color = geraCor();
    var initial_detection_radius = generate_number_per_interval(40, 120);
    var ninhada_min = generateInteger(1, 1);
    var ninhada_max = ninhada_min + generateInteger(1, 8);
    var litter_interval = [ninhada_min, ninhada_max];
    var sex;

    if(Math.random() < 0.5){
        sex = 'XX'
    } else{
        sex = 'XY'
    }

    if(conf_c) {
        initial_radius = conf_c.initial_radius;
        max_speed = conf_c.max_speed;
        max_strength = conf_c.max_strength;
        color = conf_c.color;
        litter_interval = conf_c.litter_interval
        sex = conf_c.sex
    }

    var dna = new DNA(
        initial_radius,
        max_speed,
        max_strength,
        color,
        initial_detection_radius,
        litter_interval,
        sex
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
    var color = "rgb(" + r + "," + g + "," + b + ")";

    return color;
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
            .map(function(color) { //pegar cada elemento do array e fazer os cálculos a seguir
                color = parseInt(color);
                let operacao = "";
                let p = Math.random();

                if(color <= 10) { //para não gerar números negativos
                    operacao = "adicao"
                } else if(color >= 246) { //para não gerar valores maiores que 256
                    operacao = "subtracao"

                } else { //randomiza se vai ser add ou subtraido valores caso a color estiver entre 10 e 246
                    if(Math.random() < 0.5) {
                        operacao = "adicao"
                    } else {
                        operacao = "subtracao"
                    }
                }

                if(operacao == "adicao") {
                    if(p < 0.002){ // Há 0.2% de chance de a mutação ser grande
                        return Math.ceil(color + color * (Math.random() * magnitude_mutacao * 10));
                    } else if(p < 0.008){ // Há 0.6% de chance (0.8% - o 0.2% do if anterior) de a mutação ser razoavelmente grande
                        return Math.ceil(color + color * (Math.random() * magnitude_mutacao * 4));
                    } else if(p < 0.028){ // Há 2% de chance (2.8% - o 0.8% do if anterior) de a mutação ser razoável
                        return Math.ceil(color + color * (Math.random() * magnitude_mutacao * 2));
                    } else{
                        // return color + Math.ceil(Math.random() * 10)
                        return Math.ceil(color + color * (Math.random() * magnitude_mutacao));
                    }
                    
                } else { //subtração
                    if(p < 0.002){ // Há 0.2% de chance de a mutação ser grande
                        return Math.ceil(color - color * (Math.random() * magnitude_mutacao * 10));
                    } else if(p < 0.008){ // Há 0.6% de chance (0.8% - o 0.2% do if anterior) de a mutação ser razoavelmente grande
                        return Math.ceil(color - color * (Math.random() * magnitude_mutacao * 4));
                    } else if(p < 0.028){ // Há 2% de chance (2.8% - o 0.8% do if anterior) de a mutação ser razoável
                        return Math.ceil(color - color * (Math.random() * magnitude_mutacao * 2));
                    } else{
                        return Math.ceil(color - color * (Math.random() * magnitude_mutacao));
                    }
                }
            });
        
        // console.log("MUTAÇÃO DE COR");
        return `rgb(${cores[0]},${cores[1]},${cores[2]})`
    } else{
        return estilo;
    }
}

function newMutation(valor) {// exemplo: valor = 20;  magnitude_mutacao = 0.05 || 5%
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
        variacao *= 2                   //  puxo o point de referência para o menor valor possível. Logo, o resultado variará de
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
        let variacao_ninhada_min = generateInteger(0, 2 + Math.floor(magnitude_mutacao * 10));
        let variacao_ninhada_max = generateInteger(0, 2 + Math.floor(magnitude_mutacao * 10));
 
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



function generate_number_per_interval(min, max) {
    let delta = max - min; // exemplo: 4000 e 6000. 6000 - 4000 = 2000
    return parseFloat((Math.random() * delta + min).toFixed(4)); // Math.random() * 2000 + 4000
}

function criaVegetablesGradativo(){
    if(!is_paused){ // Para de criar vegetables enquanto a simulação estiver pausada
        var x = Math.random() * (universe_width - 62) + 31;
        var y = Math.random() * (universe_height - 62) + 31;
        var radius = Math.random() * 1.5 + 1;

        if(Vegetable.vegetables.length < 3000){ // Limitador para não sobrecarregar a simulação
            new Vegetable(x, y, radius);
        }
        
    }
}

function update_vegetables_apparition_interval(novoValor, criar=false) {
    novoTempo = 1000 / novoValor
    if(!criar) {
        clearInterval(intervaloTaxaVegetables);
    }
    if(novoTempo > 1000) return;
    if(is_before_play) return;
    intervaloTaxaVegetables = setInterval(criaVegetablesGradativo, novoTempo)
}

function update_mutation_probability(novoValor){
    probabilidade_mutacao = novoValor / 100;
}

function update_mutation_magnitude(novoValor){
    magnitude_mutacao = novoValor / 100;
}


function displayQuadTree(qtree){
    qtree.display();

    let scope = new Rectangle(Math.random() * universe_width, Math.random() * universe_height, 170, 123);
    c.rect(scope.x - scope.w, scope.y - scope.h, scope.w*2, scope.h*2);
    c.strokeStyle = "green";
    c.lineWidth = 3;
    c.stroke();

    let points = qtree.procura(scope);
    for(let p of points){
        c.beginPath();
        c.arc(p.x, p.y, 1, 0, 2 * Math.PI);
        c.strokeStyle = "red";
        c.stroke();
    }
}

function criaPoints(){
    let congregacao = new Point(Math.random() * universe_width, Math.random() * universe_height);
    
    for(var i = 0; i < 500; i++){
        let p = new Point(Math.random() * universe_width, Math.random() * universe_height);
        qtree.insert_point(p);
    }
    for(var i = 0; i < 300; i++){
        let p = new Point(congregacao.x + (Math.random() - 0.5) * 300, congregacao.y + (Math.random() - 0.5) * 300);
        qtree.insert_point(p);
    }
    for(var i = 0; i < 400; i++){
        let p = new Point(congregacao.x + (Math.random() - 0.5) * 600, congregacao.y + (Math.random() - 0.5) * 600);
        qtree.insert_point(p);
    }
    for(var i = 0; i < 400; i++){
        let p = new Point(congregacao.x + (Math.random() - 0.5) * 800, congregacao.y + (Math.random() - 0.5) * 800);
        qtree.insert_point(p);
    }
}


var idAnimate;

function pausa(){
    is_paused = true;

    button_pause_simulation.classList.add("d-none");
    button_resume_simulation.classList.remove("d-none");

}

function despausa(){
    is_paused = false;

    button_resume_simulation.classList.add("d-none");
    button_pause_simulation.classList.remove("d-none");

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
    if(is_paused == false){
        idAnimate = requestAnimationFrame(animate);
    }
    
    c.clearRect(0, 0, universe_width, universe_height);
    c.beginPath();
    c.moveTo(-3, -4);
    c.lineTo(universe_width + 3, -3);
    c.lineTo(universe_width + 3, universe_height + 3);
    c.lineTo(-3, universe_height + 3);
    c.lineTo(-3, -3);
    c.strokeStyle = "white";
    c.stroke();

    // Criando a Quadtree
    let qtree = new QuadTree(retanguloCanvas, 10);


    // limitador_de_loop = 0;

    Vegetable.vegetables.forEach(vegetable => {
        vegetable.display();
        qtree.insert_vegetable(vegetable); // Insere o vegetable na QuadTree

    })

    Organism.organisms.forEach((organism) => {
        organism.create_space_delimitation(false); // telaDividida: false
    })

    Organism.organisms.forEach(organism => {
        qtree.insert_organism(organism); // Insere o organism na QuadTree
    });
    

    Organism.organisms.forEach(organism => {
        organism.update();
        organism.roam();

        // Transforma o radius de detecção em um objeto círculo para podermos manipulá-lo
        let vision = new Circle(organism.position.x, organism.position.y, organism.detection_radius);

        // julia: essa chamada de função não está funcionando, vale checar se a função está correta, quando tiro o comentário ele começa a procreate infinitamente
        // if(organism.energy <= organism.max_energy * percentual_energy_to_eat){ // FOME
        //     organism.find_prey(qtree, vision);
        // }
    })
}


function generateInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

// ----------------------------------------------------------------------------------------------
//                                         Cronômetro
// ----------------------------------------------------------------------------------------------
var cronometro;

function create_timer(){
    cronometro = setInterval(() => { timer(); }, 10);
}

function timer() {
    if(!is_paused){ // Só atualiza se a simulação não estiver pausada
        if ((milisegundo += 10) == 1000) {
        milisegundo = 0;
        segundo++;
        total_of_seconds++;
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

function reset_timer(){
    hora = minuto = segundo = milisegundo = total_of_seconds = 0;

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
