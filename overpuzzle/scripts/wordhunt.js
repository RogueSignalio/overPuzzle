//===========================================================================
// OverPuzzle
//---------------------------------------------------------------------------
// Authors: BlackRogue01 (dallen@trammelventures.com)
// Copyright: RogueSignal.io, wwww.roguesignal.io, 2024
//---------------------------------------------------------------------------
// 
//  See README.txt
//===========================================================================
class Wordhunt extends Codepuzzle {
  constructor(puzzle,overmaster) {
    let temp_config = {
      word_list: [],
      sha_list: [],
      piece_labels: false,
      ...puzzle
    }
    super(temp_config,overmaster);
    this.answer_length = this.config.answer_length = this.config.rows > this.config.columns ? this.config.rows : this.config.columns
  }

  init() {
    super.init()
  //   this.word_list = this.config.word_list
  //   this.md5_list = this.config.md5_list
  //   this.use_checksum = false
  //   if (this.md5_list.length > 0) { this.use_checksum = true }
  }

  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    super.preload()
  }

  create() {
    WebFont.load({
      google: { families: [ 'Share Tech Mono' ] },
      active: ()=>{ super.create() }
    })
  }

  check_board() {
    let solve_ids = this.selected_answers.map((i)=>{ return i.dat.solve_id })
    let check_ids = this.check_merge(solve_ids)
    console.log('Done?', this.answer, check_ids,(this.answer == check_ids))
    // if (this.answer == check_ids) {
    //   this.win_puzzle()
    // }
  }

  start_puzzle (rows, columns) {
    this.slice_puzzle(rows,columns)
    this.pieces.postFX.addGlow("0x000000",5,0)
    this.pieces.postFX.addGlow("0x000000",5,0)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);
    
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        let piece = this.grid[x][y]
        piece.dat.overfx = {}
        piece.dat.on = false
        piece.dat.count = 0
        piece.dat.positions = []
        piece.dat.decrementing = true
        piece.dat.disabled = false
        piece.dat.on_click = null
        let xadj = piece.x + this.pieces.x - (this.piece_width/2)
        let yadj = piece.y + this.pieces.y - (this.piece_height/2)
        let alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        piece.dat.overfx.label = this.add.text( xadj, yadj , random_item(alpha) , 
          { 
            originX: 0,
            originY: 0,          
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: (this.piece_width * 0.85) + 'px', 
            color: '#88220099',
          }
        );
        piece.dat.overfx.label.x += (this.piece_width - piece.dat.overfx.label.width)/2
        piece.dat.overfx.label.y += (this.piece_height - piece.dat.overfx.label.height)/2
      }
    }

    this.shuffle_board();
  }

  // slice_puzzle(rows,columns) {

  // }


}
