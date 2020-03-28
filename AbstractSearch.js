/**
 * Template class search
 **/
class AbstractSearch {

	constructor() {
		this.queens   = [];
		this.id       = '';     // Id search
		this.lines    = 0;      // Lines puzzle
		this.columns  = 0;      // Columns puzzle
		this.time     = '00:00:00';
		this.finished = false;
		this.success  = false
		this.speed    = 500;
		this.stoped   = false;
	}

	/**
	* Public method to set position queens
	**/

	createQueens = matrix => {
		this.queens  = [];
		this.lines   = matrix[0] - 1;
		this.columns = matrix[1] - 1;
		
		for (let i=0; i<=this.columns; i++) {
			this.queens.push(0);
		}
	}

	shuffleQueens = shuffle => {
		this.queens = [];
		for (let q in shuffle) { 
			this.queens.push(shuffle[q]);
		}
	}

	processGlobalHeuristic = queens => {
		let h = 0;
		for (let q=0; q<=queens.length; q++) {
			for (let i=1; i<(queens.length-q); i++) {
				// Check attack horizontal
				h += ((queens[q+i] == (queens[q])) ? 1 : 0)
				// Check attack diagonal top
				h += ((queens[q+i] == (queens[q]-i)) ? 1 : 0);
				// Check attack diagonal bottom
				h += ((queens[q+i] == (queens[q]+i)) ? 1 : 0);
			}
		}
		return h;
	}

	clearSearch = () => {
		this.queens   = [];
		this.finished = false;
		this.time     = '00:00:00';
		this.steps    = 0;
		this.stoped   = false;
	}

	finishSearch = success => {
		this.finished = true;
		this.success = success;
	}

	sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
}
