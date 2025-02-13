//===========================================================================
// OverPuzzle
//---------------------------------------------------------------------------
// Authors: BlackRogue01 (dallen@trammelventures.com)
// Copyright: RogueSignal.io, wwww.roguesignal.io, 2024
//---------------------------------------------------------------------------
// 
//  See README.txt
//===========================================================================
class Keypadpuzzle extends Codepuzzle {
  constructor (puzzle,overmaster) {
    let temp_config = {
      answer_length: 3,
      multiples: 0,
      disabled_pieces: [],
      piece_labels: true,
      show_selected: true,
      show_panel: null,
      piece_labels: false,
      piece_glow: false,      
      ...puzzle
    }
    super(temp_config,overmaster);
    this.answer_length = this.config.answer_length
  }

  init() {
    super.init()
    this.shows_panel = true
    if (!this.config.piece_glow) { this.config.piece_labels = false }
  }


  play_piece(piece) {
    if (!this.interactive) { return; }
    if (piece.dat.disabled) { return; }
    if (piece.dat.on_click) {
      piece.dat.on_click.call(this)
      return true;
    }

    if (this.selected_answers.length < this.answer_length) {
      this.select_piece(piece)
    } else {
      return false
    }
    this.panel_update('code_display',this.selected_ids.join(''))
    this.check_board()
    return true
  }  
}