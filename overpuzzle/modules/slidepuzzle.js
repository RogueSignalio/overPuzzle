class Slidepuzzle extends Imagepuzzle {
  constructor(puzzle,overmaster) {
    super(puzzle,overmaster);
  }

  start_puzzle(rows, columns) {
    this.slice_puzzle(rows,columns)
    this.pieces.postFX.addGlow("0x000000",5,0)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);
    this.open_piece.alpha = 0;
    this.last_move = null;
    this.shuffle_board();
  }

  win_puzzle() {
    const fxShadow = this.pieces.preFX.addShadow(0, 0, 0.06, 0.75, 0x000000, 4, 0.8);
    this.open_piece.alpha = 1;
    super.win_puzzle()
  }

  play_piece(piece) {
    if (!this.interactive) { return; }
    const spacer = this.open_piece;
    const pr = piece.data.values.row
    const pc = piece.data.values.column
    const sr = spacer.data.values.row
    const sc = spacer.data.values.column
    let tx = piece.x
    let ty = piece.y
    let tsx = spacer.x
    let tsy = spacer.y

    if ((pr != sr) && (pc != sc)) { return }      

    let swap = false
    if (pr == sr) {
      if ((pc - 1) == sc) {
        swap = true
        ty -= this.piece_height
      }
      else if ((pc + 1) == sc) {
        swap = true
        ty += this.piece_height
      }
    }
    else if (pc == sc) {
      if ((pr - 1) == sr) {
        swap = true
        tx -= this.piece_width
      }
      else if ((pr + 1) == sr) {
        swap = true
        tx += this.piece_width
      }
    }
    if (swap == true) {
      spacer.data.values.row = pr
      spacer.data.values.column = pc
      piece.data.values.row = sr
      piece.data.values.column = sc
      this.grid[pr][pc] = spacer
      this.grid[sr][sc] = piece

      console.log(spacer.x,spacer.y)
      console.log(piece.x,piece.y)
      spacer.x = piece.x;
      spacer.y = piece.y;
      console.log(tx, ty, this.config.move_speed)
      this.slide_piece(piece, tx, ty, this.config.move_speed, this.check_board );
    }
  }

}
