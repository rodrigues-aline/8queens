/**
 * Execute Algorithm 8 Queens Problem (UNIFESP - PPGCC)
 * Professor: Fabio Faria
 * Author:    Aline Rodrigues
 * Created:   2018-09-30
 **/

/**
 * Class CSP
 **/

function CSP(id, heuristic) {
	this.id       = id;
	this.steps    = 0;
	this.not_used = [];
}

var csp_search;

self.onmessage = event => {
	let data = event.data;
  	switch (data['command']) {
    	case 'init': 
    		importScripts(data['path'] + '/AbstractSearch.js');
    		CSP.prototype = new AbstractSearch();

    		CSP.prototype.createQueens = function (matrix) {
				this.queens  = [];
				this.lines   = matrix[0] - 1;
				this.columns = matrix[1] - 1;
				
				for (let i=0; i<=this.columns; i++) {
					this.queens.push(-1);
				}
			}

			CSP.prototype.positionAvailable = function (q_col, q_line) {
				for (let x=0; x<this.not_used.length; x++) {
					if (this.not_used[x][0] == q_col && this.not_used[x][1] == q_line) {
						return false;
					}
				}
				return true;
			}

			CSP.prototype.notAttacks = function (q_col, q_line) {
				let i = 1;
				for (let q=(q_col-1); q>=0; q--) {
					// Check attack horizontal
					if (this.queens[q] == q_line) return false;
					// Check attack diagonal top
					if (this.queens[q] == (q_line-i)) return false;
					// Check attack diagonal bottom
					if (this.queens[q] == (q_line+i)) return false;

					i += 1;
				}
				return true;
			}

			CSP.prototype.processBacktracking = async function (queen_col) {
				if (!this.stoped) {
					if (this.queens[queen_col] == this.lines) {
						this.steps += 1;
						self.postMessage({ 'command'   : 'change_queen', 
						                   'search'    : this.id, 
						                   'column'    : queen_col,
						                   'new_queen' : -1, 
						                   'old_queen' : this.queens[queen_col],
						                   'steps'     : this.steps });
						this.queens[queen_col] = -1;
						queen_col -= 1;
					}
					else {
						for (let l=(this.queens[queen_col] + 1); l<this.queens.length; l++) {
							if (this.positionAvailable(queen_col, l) && this.notAttacks(queen_col, l)) {
								this.steps += 1;
								self.postMessage({ 'command'   : 'change_queen', 
								                   'search'    : this.id, 
								                   'column'    : queen_col,
								                   'new_queen' : l, 
								                   'old_queen' : this.queens[queen_col],
								                   'steps'     : this.steps });
								this.queens[queen_col] = l;
								queen_col += 1;
								break;
							}
							else if (l == this.lines) {
								this.steps += 1;
								self.postMessage({ 'command'   : 'change_queen', 
								                   'search'    : this.id, 
								                   'column'    : queen_col,
								                   'new_queen' : -1, 
								                   'old_queen' : this.queens[queen_col],
								                   'steps'     : this.steps });
								this.queens[queen_col] = -1;
								queen_col -= 1;
							}
						}
					}

					if (queen_col <= this.columns) {
						await this.sleep(this.speed);
						this.processBacktracking(queen_col);
					}
					else {
						if (this.processGlobalHeuristic(this.queens) == 0) {
							this.finishSearch(true);
							self.postMessage({ 'command' : 'finish', 
								               'search'  : this.id, 
								               'success' : true,
								               'steps'   : this.steps});
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
			}

    		csp_search = new CSP(data['id'], data['heuristic']);
    		csp_search.createQueens(data['matrix']); 
      		break;
      	case 'start':
      		csp_search.stoped = false;
      		csp_search.speed  = data['speed'];
      		if (data['start_many'] && data['count'] < 100) {
      			this.finishSearch(true);
      		}
      		else {
      			if (!csp_search.finish) csp_search.processBacktracking(0);
      		}
      		break;
    	case 'restart':
    		if (data['start_many'] && data['count'] < 100) break;
    		csp_search.clearSearch();
    		csp_search.not_used = [[0, 0], [0, data['matrix'][1] -1 ], [data['matrix'][0] - 1, 0], [data['matrix'][0] - 1, data['matrix'][1] - 1]];
			csp_search.createQueens(data['matrix']);
    		break;
    	case 'stop':
    		csp_search.stoped = true;
    		break; 
    	case 'speed':
    		csp_search.speed = data['speed'];
    		break;
  	}
}
