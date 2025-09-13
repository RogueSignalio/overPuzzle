//===========================================================================
// OverPuzzle
//---------------------------------------------------------------------------
// Authors: BlackRogue01 (dallen@trammelventures.com)
// Copyright: RogueSignal.io, wwww.roguesignal.io, 2024
//---------------------------------------------------------------------------
// 
//  See README.txt
//===========================================================================
class Swappuzzle extends Codepuzzle {
  constructor (puzzle,overmaster) {
    let temp_config = {
      piece_labels: false,
      ...puzzle
    }
    super(temp_config,overmaster);
  }

  start_puzzle (rows, columns) {
    this.slice_puzzle(rows,columns)
//    this.pieces.postFX.addGlow("0x000000",5,0)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);

    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        let piece = this.grid[x][y]
        piece.dat.overfx = {}
        piece.dat.on = false
        piece.dat.positions = []
        piece.dat.decrementing = true
        piece.dat.count = 0
      }
    }
    this.shuffle_board();
  }

  play_piece(piece) {
    if (this.interactive == false) { return false; }

    if ((this.last_move == null) || (piece.dat.id == this.last_move)) {
      // Unclicked piece
      if (piece.dat.on == false) {
        this.select_piece(piece)
        this.open_piece = this.piece_by_id(this.last_move)  
      }
      // Clicked piece
      else if (piece.dat.on == true) {
        this.unselect_piece(piece)
        this.last_move = null
      }
    } else {
      this.unselect_piece(this.open_piece)
      this.play_swap_piece(piece.dat.row , piece.dat.column, null, this.check_board );
      this.last_move = null
    }
    return true
  }

  check_ids() {
    let check_ids = []
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        check_ids.push(this.grid[x][y].dat.solve_id)
      }
    }
    return check_ids
  }

  merge_ids(chr=',') {
    return this.check_ids().join(chr)
  }

  // You probably need to override this method to check winning condition.
  check_board() {
    let check_ids = []
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        check_ids.push(this.grid[x][y].dat.solve_id)
      }
    }    
    if (this.answer == this.check_merge(check_ids)) {
      this.win_puzzle()
    } else {
      //console.log('Done?', done_ids, check_ids.join(','),(done_ids == check_ids.join(',')))      
    }
  }

  play_swap_piece (row, column,speed=this.config.move_speed) {
    const piece = this.get_piece(row, column);
    const x = this.open_piece.x;
    const y = this.open_piece.y;

    piece.dat.row = this.open_piece.dat.row;
    piece.dat.column = this.open_piece.dat.column;
    this.open_piece.dat.row = row;
    this.open_piece.dat.column = column;
    this.grid[row][column] = this.open_piece
    this.grid[piece.dat.row][piece.dat.column] = piece

    this.open_piece.setPosition(piece.x, piece.y);
    this.slide_piece(piece,x,y,speed,this.check_board)
  }

}