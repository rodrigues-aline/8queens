/**
 * Execute Algorithm 8 Queens Problem (UNIFESP - PPGCC)
 * Professor: Fabio Faria
 * Author:    Aline Rodrigues
 * Created:   2018-09-30
 **/

/**
 * Class Genetic
 *
 * gene = [0,0,0,0,0,0,0,0]
 * possition vector is colunm 
 * value in possition vector is line
 **/
function Genetic(id) {
    this.id           = id;
    this.population   = [];
    this.t_population = 200;
    this.selection    = 4;
    this.crossover    = [];
    this.mutation     = [];
}

var genetic_search;

self.onmessage = event => {
    let data = event.data;
    switch (data['command']) {
        case 'init': 
            importScripts(data['path'] + '/AbstractSearch.js');
            Genetic.prototype = new AbstractSearch();

            Genetic.prototype.processCrossover = function (parents) {
                this.crossover = [];
                let gene = [];
                for (let x=0; x<(parents.length-1); x++) {
                    for (let y=(x+1); y<parents.length; y++) {
                        gene = [];
                        gene = gene.concat(parents[x][1].slice(0, 2));
                        gene = gene.concat(parents[y][1].slice(2, 4));
                        gene = gene.concat(parents[x][1].slice(4, 6));
                        gene = gene.concat(parents[y][1].slice(6, 8));
                        this.crossover.push(gene);

                        gene = [];
                        gene = gene.concat(parents[y][1].slice(0, 2));
                        gene = gene.concat(parents[x][1].slice(2, 4));
                        gene = gene.concat(parents[y][1].slice(4, 6));
                        gene = gene.concat(parents[x][1].slice(6, 8));
                        this.crossover.push(gene);

                        gene = [];
                        gene = gene.concat(parents[x][1].slice(0, 4));
                        gene = gene.concat(parents[y][1].slice(4, 8));
                        this.crossover.push(gene);

                        gene = [];
                        gene = gene.concat(parents[y][1].slice(0, 4));
                        gene = gene.concat(parents[x][1].slice(4, 8));
                        this.crossover.push(gene);

                        gene = [];
                        gene = gene.concat(parents[x][1].slice(0, 5));
                        gene = gene.concat(parents[y][1].slice(5, 8));
                        this.crossover.push(gene);

                        gene = [];
                        gene = gene.concat(parents[y][1].slice(0, 5));
                        gene = gene.concat(parents[x][1].slice(5, 8));
                        this.crossover.push(gene);

                        gene = [];
                        gene = gene.concat(parents[x][1].slice(0, 6));
                        gene = gene.concat(parents[y][1].slice(6, 8));
                        this.crossover.push(gene);

                        gene = [];
                        gene = gene.concat(parents[y][1].slice(0, 6));
                        gene = gene.concat(parents[x][1].slice(6, 8));
                        this.crossover.push(gene);

                        gene = [];
                        gene = gene.concat(parents[x][1].slice(0, 8));
                        gene = gene.concat(parents[y][1].slice(8));
                        this.crossover.push(gene);

                        gene = [];
                        gene = gene.concat(parents[y][1].slice(0, 8));
                        gene = gene.concat(parents[x][1].slice(8));
                        this.crossover.push(gene);
                    }
                }
            }

            Genetic.prototype.processMutation = function (parents) {
                this.mutation = [];
                let gene = [];
                let aux;
                let c1;
                let c2;
                let c3;
                let c4;
                for (let x=0; x<parents.length; x++) {
                    gene     = parents[x][1].slice();
                    c1       = Math.floor(Math.random() * 7);
                    c2       = Math.floor(Math.random() * 7);
                    aux      = gene[c1];
                    gene[c1] = gene[c2];
                    gene[c2] = aux;
                    this.mutation.push(gene);

                    gene     = parents[x][1].slice();
                    c1       = Math.floor(Math.random() * 7);
                    c2       = Math.floor(Math.random() * 7);
                    c3       = Math.floor(Math.random() * 7);
                    c4       = Math.floor(Math.random() * 7);
                    aux      = gene[c1];
                    gene[c1] = gene[c3];
                    gene[c3] = aux;
                    aux      = gene[c2];
                    gene[c2] = gene[c4];
                    gene[c4] = aux;
                    this.mutation.push(gene);
                }
            }

            Genetic.prototype.determineFitnessSelection = function (parents) {
                this.population = parents;
                for (let t=0; t<this.crossover.length; t++) {
                    this.population.push([this.processGlobalHeuristic(this.crossover[t]), this.crossover[t]]);
                }
                for (let t=0; t<this.mutation.length; t++) {
                    this.population.push([this.processGlobalHeuristic(this.mutation[t]), this.mutation[t]]);
                }
                this.population.sort((a, b) => a[0] - b[0]);
            }

            Genetic.prototype.initAndFitnessPopulation = function () {
                this.population = [];
                let shuffle     = [];
                for (let t=0; t<this.t_population; t++) {
                    shuffle = Array.apply(null, {length: (this.lines + 1)}).map(Number.call, Number);
                    shuffle = shuffle.sort(() => (.5 - Math.random()));
                    this.population.push([this.processGlobalHeuristic(shuffle), shuffle]);
                }
                this.population.sort((a, b) => a[0] - b[0]);
            }

            Genetic.prototype.startGeneration = async function () {
                // Randomly initialize and determine fitness population(t)
                this.initAndFitnessPopulation();

                this.steps = 0
                while (this.steps < this.selection) {
                    if (!this.stoped) {
                        // Select parents from population(t)
                        parents = this.population.slice(0, 161);
                        // Perform crossover on parents creating population(t+1)
                        this.processCrossover(parents);
                        // Perform mutation of population(t+1)
                        this.processMutation(parents);
                        // Determine fitness selecion
                        this.determineFitnessSelection(parents);

                        self.postMessage({ 'command'   : 'change_state', 
                                           'search'    : this.id, 
                                           'new_state' : this.population[0][1], 
                                           'steps'     : 'Selection: ' + (this.steps + 1) + ((this.population[0][0] > 0) ? ' Attacks: ' + this.population[0][0] : '')});

                        if (this.population[0][0] == 0) {
                            this.finishSearch(true);
                            self.postMessage({ 'command' : 'finish', 
                                               'search'  : this.id, 
                                               'success' : true,
                                               'steps'   : 'Selection: ' + (this.steps + 1) + ((this.population[0][0] > 0) ? ' Attacks: ' + this.population[0][0] : '')});
                            return;
                        }
                        this.steps += 1
                        await this.sleep(this.speed);
                    }
                }
                this.finishSearch(false);
                self.postMessage({ 'command' : 'finish', 
                                   'search'  : this.id, 
                                   'success' : false,
                                   'steps'   : 'Selection: '+this.steps+((this.population[0][0] > 0)?' Attacks: '+this.population[0][0]:'')});  
            }

            genetic_search = new Genetic(data['id']);
            genetic_search.createQueens(data['matrix']);
            break;
        case 'start':
            genetic_search.stoped = false;
            genetic_search.speed  = data['speed'];
            if (!genetic_search.finish) genetic_search.startGeneration();
            break;
        case 'restart':
            this.population = [];
            this.crossover  = [];
            this.mutation   = [];
            genetic_search.clearSearch();
            genetic_search.createQueens(data['matrix']);
            break;
        case 'stop':
            genetic_search.stoped = true;
            break; 
        case 'speed':
            genetic_search.speed = data['speed'];
            break;
    }
}