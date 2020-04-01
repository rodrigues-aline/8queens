/**
 * Execute Algorithm 8 Queens Problem (UNIFESP - PPGCC)
 * Professor: Fabio Faria
 * Author:    Aline Rodrigues
 * Created:   2018-09-30
 **/

/**
 * Class Hill Climbing
 *
 * this.queens = [0, 0, 0, 0, 0, 0, 0, 0]
 * possition vector is colunm
 * value in possition vector is line
 **/

function HillClimbing(id) {
	this.id             = id;
	this.steps          = 0;
	this.new_heuristic  = 0;
	this.old_heuristic  = 0;
	this.limit_search   = 0;
}
   
var hc_search;

self.onmessage = event => {
	let data = event.data;
  	switch (data['command']) {
    	case 'init': 
    		importScripts(data['path'] + '/AbstractSearch.js');
    		HillClimbing.prototype = new AbstractSearch();

    		HillClimbing.prototype.processLocalHeuristic = function (q) {	
				let h = 0;
				if (q < this.columns) {
					// Check attack horizontal
					h += ((this.queens[q+1] == (this.queens[q])) ? 1 : 0);
					// Check attack diagonal top
					h += ((this.queens[q+1] == (this.queens[q]-1)) ? 1 : 0);
					// Check attack diagonal bottom
					h += ((this.queens[q+1] == (this.queens[q]+1)) ? 1 : 0);
				}
				if (q > 0) {
					// Check attack horizontal
					h += ((this.queens[q-1] == (this.queens[q])) ? 1 : 0);
					// Check attack diagonal top
					h += ((this.queens[q-1] == (this.queens[q]-1)) ? 1 : 0);
					// Check attack diagonal bottom
					h += ((this.queens[q-1] == (this.queens[q]+1)) ? 1 : 0);
				}
    			return h;
    		}

    		HillClimbing.prototype.localSearch = async function () {
    			for (let q=0; q<=this.columns; q++) {
    				let current_h = this.processLocalHeuristic(q);
    				let best_h    = [[current_h, this.queens[q]]];

					for (let new_q=0; new_q<=this.columns; new_q++) {
						if (new_q != this.queens[q]) {
							let h = 0;
		    				if (q < this.columns) {
		    					// Check attack horizontal
		    					h += ((this.queens[q+1] == (new_q)) ? 1 : 0);
		    					// Check attack diagonal top
		    					h += ((this.queens[q+1] == (new_q-1)) ? 1 : 0);
		    					// Check attack diagonal bottom
		    					h += ((this.queens[q+1] == (new_q+1)) ? 1 : 0);
		    				}
		    				if (q > 0) {
		    					// Check attack horizontal
		    					h += ((this.queens[q-1] == (new_q)) ? 1 : 0);
		    					// Check attack diagonal top
		    					h += ((this.queens[q-1] == (new_q-1)) ? 1 : 0);
		    					// Check attack diagonal bottom
		    					h += ((this.queens[q-1] == (new_q+1)) ? 1 : 0);
		    				}
		    				if (h < best_h[0][0]) {
		    					best_h = [[h, new_q]];
		    				}
		    				else if (h == best_h[0][0]) {
		    					if (best_h[0][1] == this.queens[q]) best_h = [];
		    					best_h.push([h, new_q]);
		    				}

						}
					}

					// Get best heuristic global <= current global heuristic
					let best_global = []; 
					let h;
					let copy_queens = [];
					for (let x=0; x<best_h.length; x++) {
						copy_queens = this.queens.slice();
						copy_queens[q] = best_h[x][1];
						h = this.processGlobalHeuristic(copy_queens);
						if (h <= this.new_heuristic) {
							best_global.push([h, best_h[x][1]]);
						}
					}

					// Move queen in best heuristic state
					if (best_global.length > 0) {
						best_global.sort((a, b) => a[0] - b[0]);
						this.steps += 1;
						self.postMessage({ 'command'   : 'change_queen', 
						                   'search'    : this.id, 
						                   'column'    : q,
						                   'new_queen' : best_global[0][1], 
						                   'old_queen' : this.queens[q],
						                   'steps'     : this.steps });
						this.queens[q] = best_global[0][1];
						await this.sleep(this.speed);
					}
					
    			}
    			this.chooseState();
    		}

			HillClimbing.prototype.chooseState = function () {
				this.new_heuristic = this.processGlobalHeuristic(this.queens);

				if (this.new_heuristic > 0) {
					if (!this.stoped){
						if (this.limit_search <= 3) {
							if (this.old_heuristic != 0 && (this.new_heuristic == this.old_heuristic)) {
								this.limit_search += 1;
							}
							else this.limit_search = 0;
							this.old_heuristic = this.new_heuristic;
							this.localSearch();
						} 
						else {
							this.finishSearch(false);
							self.postMessage({ 'command' : 'finish', 
								               'search'  : this.id, 
								               'success' : false,
								               'steps'   : this.steps});
						}
					}
				}
				else {
					this.finishSearch(true);
					self.postMessage({ 'command' : 'finish', 
						               'search'  : this.id, 
						               'success' : true,
						               'steps'   : this.steps});
				}			
			}

    		hc_search = new HillClimbing(data['id']);
    		hc_search.createQueens(data['matrix']);
    		self.postMessage({ 'command' : 'set_queens'});
      		break;
      	case 'start':
      		hc_search.stoped = false;
      		hc_search.speed  = data['speed'];
      		if (!hc_search.finished) hc_search.chooseState();
      		break;
    	case 'restart':
    		hc_search.old_heuristic = 0;
			hc_search.new_heuristic = 0;
			hc_search.limit_search  = 0;
    		hc_search.clearSearch();
			hc_search.createQueens(data['matrix']);
			hc_search.shuffleQueens(data['shuffle']);
    		break;
    	case 'stop':
    		hc_search.stoped = true;
    		break; 
    	case 'speed':
    		hc_search.speed = data['speed'];
    		break;
  	}
}
