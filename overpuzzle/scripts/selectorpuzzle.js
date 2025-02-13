//===========================================================================
// OverPuzzle
//---------------------------------------------------------------------------
// Authors: BlackRogue01 (dallen@trammelventures.com)
// Copyright: RogueSignal.io, wwww.roguesignal.io, 2024
//---------------------------------------------------------------------------
// 
//  See README.txt
//===========================================================================
class Selectorpuzzle extends Codepuzzle {
  constructor (puzzle,overmaster) {
    let temp_config = {
      shuffles: 0,
      layout: {},
      piece_labels: false,
      ...puzzle
    }
    super(temp_config,overmaster);
  }

  start_puzzle (rows, columns) {
    this.layout_puzzle(this.config.layout)
    this.pieces.postFX.addGlow("0x000000",5,0)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);

    // for (let x = 0; x < this.config.rows; x++) {
    //   for (let y = 0; y < this.config.columns; y++) {
    //     this.grid[x][y].dat = {}
    //     this.grid[x][y].dat.overfx = {}
    //     this.grid[x][y].dat.on = false        
    //   }
    // }
    this.interactive = true
    this.last_move = null;
  }

  start_play() {
    // this.answer_coords = this.answer_positions().join(' : ');
    super.start_play()
  }

}