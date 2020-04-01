 
/**
 * Execute Algorithm 8 Queens Problem (UNIFESP - PPGCC)
 * Professor: Fabio Faria
 * Author:    Aline Rodrigues
 * Created:   2018-09-30
 **/

 var search;

/**
 * Functions manage searches view HTML
 **/

initSearch = () => search = new Queens();

startMany = (count) => {
	$('#result_search').html('');
	search.count = count;
	search.start_many = true;
	$('#start').attr('disabled', true);
	$('#start_many').attr('disabled', true);
	$('#stop').attr('disabled', false);
	$('#restart').attr('disabled', true);
	search.restartSearches();
}

start = () => {
	if (!search.stoped)
		search.restartSearches();
	else {
		search.stoped = false;
		search.startSearches();
	}
	if (!search.start_many) {
		$('#table_result').hide();
		$('#restart').attr('disabled', true);
	}
	$('#start').attr('disabled', true);
	$('#stop').attr('disabled', false);
}

stop = () => {
	search.stoped = true;
	search.stopSearches();
	$('#stop').attr('disabled', true);
	$('#start').attr('disabled', false);
	if (!search.start_many) {
		$('#restart').attr('disabled', false);
	}
}

restart = () => {
	search.stopSearches();
	search.restartSearches();
	$('#start').attr('disabled', true);
	$('#stop').attr('disabled', false);
	$('#restart').attr('disabled', true);
}

changeSpeed = () => search.changeSpeed($('#speed').val());

sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


/**
 * Class manage searches
 **/
class Queens {
	constructor() {
		this.matrix     = [8, 8];
		this.shuffle    = []; // Define inicial position queens to start (Hill Climbing)
		this.stoped     = false;
		this.start_many = false;
		this.result     = [];
		this.count      = 0;
		
		// Manage time
		this.hours    = 0;
		this.minutes  = 0;
		this.secounds = 0;

		// Set threads to run searches
		this.path     = 'file://'+window.location.pathname.replace('8Queens.html', '');
		this.threads_search = [ {'search'  : new Worker(URL.createObjectURL(new Blob(['importScripts("'+this.path+'/HillClimbing.js")'], {type: 'text/javascript'}))),
								'id'       : 'HC',
								'time'     : '00:00:00',
								'finished' : false,
								'success'  : false,
								'steps'    : 0},

								{'search'  : new Worker(URL.createObjectURL(new Blob(['importScripts("'+this.path+'/Genetic.js")'], {type: 'text/javascript'}))),
								'id'       : 'genetic',
								'time'     : '00:00:00',
								'finished' : false,
								'success'  : false,
								'steps'    : 0},

								{'search'  : new Worker(URL.createObjectURL(new Blob(['importScripts("'+this.path+'/CSP.js")'], {type: 'text/javascript'}))),
								'id'       : 'CSP',
								'time'     : '00:00:00',
								'finished' : false,
								'success'  : false,
								'steps'    : 0} ];
		
		for (let s in this.threads_search) {
			let color = '#d8a952';
			let board = '';
			
			for (let i=0; i<this.matrix[0]; i++) {
				color = (color == 'white') ? '#d8a952' : 'white';
				board += '<tr>';
				for (let x=0; x < this.matrix[1]; x++) {
					board += '<td style="width:31px; height:31px; background-color:' + color + '" id="'+i+'_'+x+'_'+this.threads_search[s]['id']+'"></td>';
					color = (color == 'white') ? '#d8a952' : 'white';
				}
				board += '</tr>';
			}
	
			$('#board_' + this.threads_search[s]['id']).html(board);
	
			this.result.push([]);

			// Set events threads searches
			this.threads_search[s]['search'].onmessage = event => {
				let data = event.data
				switch (data['command']) {
					case 'set_queens':
						search.createQueens();
						break;
					case 'change_state':
						search.setQueens(data['search'], data['new_state'], data['steps']);
						break;
					case 'change_queen':
						search.changeQueen(data['search'], data['column'], data['old_queen'], data['new_queen'], data['steps']);
						break;
					case 'finish':
						search.setQueenFinished(data);
						break;
				} 
			};
	
			this.threads_search[s]['search'].onerror = e => {
				console.error(`Error: Line ${e.lineno} in ${e.filename}: ${e.message}`);
			};
	
			// Initialize searches
			this.threads_search[s]['search'].postMessage({'command' : 'init', 
														  'matrix'  : this.matrix, 
														  'id'      : this.threads_search[s]['id'], 
														  'path'    : this.path });
		}
	}

	setTime = (obj_in) => {
		setInterval(() => {
			// Count time
			if (obj_in.secounds == 59) {
				obj_in.secounds = 0;
				if (obj_in.minutes == 59) {
					obj_in.minutes = 0;
					obj_in.hours += 1;	
				}
				else obj_in.minutes += 1;
			}
			else obj_in.secounds += 1;

			// Flag all searches finished
			let all_finished = true;

			// Update searches run time
			for (let s in obj_in.threads_search) {
				if (!obj_in.threads_search[s]['finished']) {
					all_finished = false;
					obj_in.threads_search[s]['time'] = ((obj_in.hours < 10) ? '0' + obj_in.hours : obj_in.hours) + ':' +
											           ((obj_in.minutes < 10) ? '0' + obj_in.minutes : obj_in.minutes) + ':' +
											           ((obj_in.secounds < 10) ? '0' + obj_in.secounds : obj_in.secounds);
					$('#time_' + obj_in.threads_search[s]['id']).html('Time: ' + obj_in.threads_search[s]['time']);
				}
			}
			if (all_finished) {
				// Run once
				if (!obj_in.start_many) {
					$('#start').attr('disabled', false);
					$('#stop').attr('disabled', true);
					$('#restart').attr('disabled', true);
					obj_in.stopSearches();
				}
				// Run many times
				else {
					$('#table_result').show();
					let html = '';

					for (let s=0; s < obj_in.threads_search.length - 1; s++){
						obj_in.result[s].push({'time': obj_in.threads_search[s]['time'], 'steps': obj_in.threads_search[s]['steps'], 'status': obj_in.threads_search[s]['success']});
						html += '<td style="padding: .50rem;font-size: 12px;">\
									' + ((obj_in.threads_search[s]['success']) ? '<div class="success"></div>&nbsp;' : '<div class="fail"></div>&nbsp;') + '\
									Time: ' + obj_in.threads_search[s]['time'] + '\
									' + ((obj_in.threads_search[s]['id'] == 'genetic') ? '' : 'Steps: ') + obj_in.threads_search[s]['steps'] + '\
								 </td>';
					}
					$('#result_search').append('<tr><th scope="row" style="padding: .50rem;font-size: 12px;">' + (100-(obj_in.count-1)) + '</th>' + html + '</tr>');
					if (obj_in.count > 1) { 
						obj_in.count -= 1;
						obj_in.stopSearches();
						obj_in.restartSearches();
					}
					else {
						$('#start').attr('disabled', false);
						$('#stop').attr('disabled', true);
						$('#restart').attr('disabled', true);
						$('#start_many').attr('disabled', false);
						obj_in.start_many = false;
						obj_in.stopSearches();
	
						obj_in.processResult(obj_in.result);
					}
				}
			}
		}, 1000);	
	}

	createQueens = () => {
		for (let i=0; i < this.matrix[1]; i++){
			$('#0_' + i + '_' + this.id).html('<img src="img/queen.png" width="18" height="18">');
		}
	}

	// Used Hill Climbing
    shuffleQueens = () => {
		this.shuffle = Array.apply(null, { length: (this.matrix[0]) }).map(Number.call, Number);
		this.shuffle = this.shuffle.sort(() => { return .5 - Math.random() });
	}

	startSearches = () => {
		// Start searches in threads
		for (let s in this.threads_search) {
			if (!this.threads_search[s]['finished']) {
				// Send command to thread
				this.threads_search[s]['search'].postMessage({'command'    : 'start', 
															  'speed'      :  $('#speed').val(),
															  'start_many' : this.start_many,
															  'count'      : this.count });
			}
		}
		this.setTime(this);
	}

	stopSearches = () => {
		var id = window.setTimeout(() => {}, 0);
		
		while (id--) window.clearTimeout(id);
		
		for (let s in this.threads_search) {
			// Send command to thread
			this.threads_search[s]['search'].postMessage({'command' : 'stop'});
		}	
	}

	restartSearches = async () => {
		this.hours    = 0;
		this.minutes  = 0;
		this.secounds = 0;
		
		this.stopSearches();
		this.shuffleQueens();
		await sleep(250);
	
		for (let s in this.threads_search) {
			if (this.start_many && this.count < 100 && this.threads_search[s]['id'] == 'CSP') continue;
			this.threads_search[s]['finished'] = false;
			this.threads_search[s]['success']  = false;
			this.threads_search[s]['steps']    = 0;
			$('#time_' + this.threads_search[s]['id']).html('Time: 00:00:00');
			$('#status_' + this.threads_search[s]['id']).html('Status: -');
			$('#steps_' + this.threads_search[s]['id']).html('Steps: 0');
			if (this.threads_search[s]['id'] == 'HC') this.setQueens(this.threads_search[s]['id'], this.shuffle, 'Steps: 0');
			if (this.threads_search[s]['id'] == 'CSP') this.setQueens(this.threads_search[s]['id'], [-1,-1,-1,-1,-1,-1,-1,-1], 'Steps: 0');
			
			// Send command to thread
			this.threads_search[s]['search'].postMessage({'command'    : 'restart', 
														  'matrix'     : this.matrix, 
														  'shuffle'    : this.shuffle,
														  'start_many' : this.start_many,
														  'count'      : this.count});
		}
		this.startSearches();
	}

	changeSpeed = speed => {
		for (let s in this.threads_search) {
			// Send command to thread
			this.threads_search[s]['search'].postMessage({'command' : 'speed', 
														  'speed'   :  speed });
		}
	}

	// Used Genetic
	setQueens = (search, new_state, steps) => {
		for (let i=0; i<this.matrix[0]; i++) {
			for (let x=0; x<this.matrix[1]; x++) {
				$('#' + i + '_' + x + '_' + search).html('');
			}
		}
		let q = 0
		for(let column=0; column<this.matrix[1]; column++) {
			$('#' + new_state[q] + '_' + column + '_' + search).html('<img src="img/queen.png" width="18" height="18">');
			q += 1;
		}
		$('#steps_' + search).html(steps);
	}

	changeQueen = (search, column, old_queen, new_queen, steps) => {
		$('#' + old_queen + '_' + column + '_' + search).html('');
		if (new_queen != -1) {
			$('#' + new_queen + '_' + column + '_' + search).html('<img src="img/queen.png" width="18" height="18">');
		}
	
		$('#steps_' + search).html('Steps: '+steps);
	}

	setQueenFinished = (search) => {
		for (let s in this.threads_search) {
			if (this.threads_search[s]['id'] == search['search']) {
				this.threads_search[s]['finished'] = true;
				this.threads_search[s]['success']  = search['success'];
				this.threads_search[s]['steps']    = search['steps'];
	
				if (search['success']) {
					$('#status_' + search['search']).html('Status: <span style="color:green;"><b>SUCCESS!</b></span>');
				}
				else {
					$('#status_' + search['search']).html('Status: <span style="color:red;"><b>FAILED!</b></span>');
				}
				break;
			}
		}
	}
}
