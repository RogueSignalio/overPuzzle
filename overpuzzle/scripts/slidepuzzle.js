//===========================================================================
// OverPuzzle
//---------------------------------------------------------------------------
// Authors: BlackRogue01 (dallen@trammelventures.com)
// Copyright: RogueSignal.io, wwww.roguesignal.io, 2024
//---------------------------------------------------------------------------
// 
//  See README.txt
//===========================================================================
class Slidepuzzle extends Imagepuzzle {
  constructor(puzzle,overmaster) {
    super(puzzle,overmaster);
  }

  start_puzzle(rows, columns) {
    this.slice_puzzle(rows,columns)
    this.pieces.postFX.addGlow("0x000000",5,0)
    if (this.config.open_piece == null) {
      this.open_piece = this.pieces.getAt(this.pieces.length - 1);
    } else {
      this.open_piece = this.grid[this.config.open_piece[0]][this.config.open_piece[1]]
    }
    this.open_piece.alpha = 0;
    this.last_move = null;
    this.shuffle_board();
  }

  win_puzzle() {
    this.open_piece.alpha = 1;
    super.win_puzzle()
  }

  play_piece(piece) {
    if (!this.interactive) { return; }
    const spacer = this.open_piece;
    const pr = piece.dat.row
    const pc = piece.dat.column
    const sr = spacer.dat.row
    const sc = spacer.dat.column
    let tx = piece.x
    let ty = piece.y
    let tsx = spacer.x
    let tsy = spacer.y

    if ((pr != sr) && (pc != sc)) { return }      

    let swap = false
    if (pr == sr) {
      if ((pc - 1) == sc) {
        swap = true
        tx -= this.piece_width
      }
      else if ((pc + 1) == sc) {
        swap = true
        tx += this.piece_width
      }
    }
    else if (pc == sc) {
      if ((pr - 1) == sr) {
        swap = true
        ty -= this.piece_height
      }
      else if ((pr + 1) == sr) {
        swap = true
        ty += this.piece_height
      }
    }
    if (swap == true) {
      spacer.dat.row = pr
      spacer.dat.column = pc
      piece.dat.row = sr
      piece.dat.column = sc
      this.grid[pr][pc] = spacer
      this.grid[sr][sc] = piece

      spacer.x = piece.x;
      spacer.y = piece.y;
      this.slide_piece(piece, tx, ty, this.config.move_speed, this.check_board );
      return true
    } else {
      return false
    }

  }

}
