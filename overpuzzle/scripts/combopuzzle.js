class Combopuzzle extends Imagepuzzle {
class Swappuzzle extends Codepuzzle {
  constructor (puzzle,overmaster) {
    let temp_config = {
      back_image: null,
      ...puzzle
    }
    super(temp_config,overmaster);
  }

  start_puzzle (rows, columns) {
    this.slice_puzzle(rows,columns)
    this.pieces.postFX.addGlow("0x000000",5,0)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);

    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        let piece = this.grid[x][y]
        piece.dat.overfx = {}
        piece.dat.on = false
        piece.dat.positions = []
        piece.dat.decrementing = true
        piece.dat.count = 0
        piece.dat.solved = false
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
    } 
    else {
      this.select_piece(this.piece)
      this.interactive == false
//      this.unselect_piece(this.open_piece)
//      this.play_swap_piece(piece.dat.row , piece.dat.column, null, this.check_board );
      if (this.open_piece.solved_id == piece.dat.solved_id) {
        setTimeout(function() {
          this.lock_piece(this.open_piece)
          this.lock_piece(this.piece)
        }.bind(this),2000);
      } else {
        setTimeout(function() {
          this.unselect_piece(this.open_piece)
        }.bind(this),2000);
      }

      this.last_move = null
    }
    return true
  }

  locked_piece(piece) {
    piece.dat.solved = true

  }
}


// 

// ids source:
// * automatic inc
// * automatic hash
