//===========================================================================
// OverPuzzle
//---------------------------------------------------------------------------
// Authors: BlackRogue01 (dallen@trammelventures.com)
// Copyright: RogueSignal.io, wwww.roguesignal.io, 2024
//---------------------------------------------------------------------------
// 
//  See README.txt
//===========================================================================
class Codepuzzle extends Imagepuzzle {
  constructor (puzzle,overmaster) {
    let temp_config = {
      answer_length: 3,
      multiples: 1,
      disabled_pieces: [],
      piece_labels: true,
      show_selected: false,
      show_panel: null,
      piece_labels: true,
      piece_glow: true,      
      ...puzzle
    }
    super(temp_config,overmaster);
    this.answer_length = this.config.answer_length
    this.multiples = this.config.multiples
  }

  init() {
    super.init()
    this.disabled_pieces_ids = []
    this.function_pieces_ids = []
    this.selected_answers = []
    this.selected_ids = []
    this.answer_ids = []
    this.answer = null
    this.answer_coords = null
    this.shows_panel = false
    if (!this.config.piece_glow) { this.config.piece_labels = false }
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

  start_puzzle (rows, columns) {
    this.slice_puzzle(rows,columns)
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
      }
    }

    for (const dxy in this.config.disabled_pieces) {
      let coord = this.config.disabled_pieces[dxy]
      let dpiece = this.grid[coord[0]][coord[1]]
      dpiece.dat.disabled = true
      dpiece.removeInteractive();
      this.disabled_pieces_ids.push(dpiece.dat.id)
    }

    for (const dxy in this.config.function_pieces) {
      let coord = this.config.function_pieces[dxy]
      let dpiece = this.grid[coord[0]][coord[1]]
      dpiece.dat.on_click = coord[2]
      this.function_pieces_ids.push(dpiece.dat.id)
    }

    // Setup answers.  If an answer has not been provided, we generate one.
    // If an answer has been provided by caller, it must be done using IDs, which are either:
    // * assigned by you (piece_ids) OR
    // * generated from image slices
    if ((!this.config.answers) && (!this.config.answer_hash)) {
      console.log('a')
      let myids = this.ids;
      while (true) {
        let pick = Phaser.Utils.Array.GetRandom(myids)
        let tpiece = this.piece_by_id(pick)
        if ((!tpiece.dat.disabled) && (tpiece.dat.on_click == null)) {
          let index = myids.indexOf(pick);
          this.answer_ids.push(pick)
          if ((this.multiples < 2) || (this.answer_ids.filter((a) => a === pick).length >= this.multiples))  {
            myids.splice(index, 1);
          }
          if (this.answer_length == this.answer_ids.length) { break; }
        }
      }
      this.answer = this.check_merge(this.answer_ids)
    }
    else if (this.hashing) {      
      this.answer_ids = []
    } else {
      this.answer_ids = this.config.answers 
    }

    this.last_move = null;
    if (this.config.show_selected) { 
      this.example_display()
      this.shows_panel = true
    } else if (this.config.show_panel) {
      this.config.show_panel.call(this) 
      this.shows_panel = true
    }
    this.shuffle_board();
  }

  start_play() {
    this.answer_coords = this.answer_positions().join(' : ');
    super.start_play()
  }

  // You probably need to override this method to check winning condition.
  check_board() {
    let solve_ids = this.selected_answers.map((i)=>{ return i.dat.solve_id })
    let check_ids = this.check_merge(solve_ids)
    //console.log('Done?', done_ids, check_ids,(done_ids == check_ids))
    if (this.answer == check_ids) {
      this.win_puzzle()
    }
  }

  select_piece(piece) {
console.log('s1')

    piece.dat.count++
    piece.dat.positions.push(this.selected_answers.length + 1)
    piece.dat.decrementing = false
    this.selected_answers.push(piece)
    this.selected_ids.push(piece.dat.id)
    this.last_move = piece.dat.id
    if (piece.dat.on == false) {
      this.hightlight_piece(piece)
    } else {
      if (this.config.piece_labels) {
        piece.dat.overfx.label.text = piece.dat.positions.join(',')
      } 
    }
    piece.dat.on = true
  }

  unselect_piece(piece) {
    piece.dat.count--
    piece.dat.positions.pop()
    piece.dat.decrementing = true

    this.selected_answers.pop() 
    this.selected_ids.pop()

    if (piece.dat.count == 0) {
      if (this.config.piece_labels) {
        piece.dat.overfx.label.destroy()
      }
      piece.dat.on = false
      this.unhightlight_piece(piece)
    } else {
      if (this.config.piece_labels) {
        piece.dat.overfx.label.text = piece.dat.positions.join(',')
      }
    }

    if (this.selected_answers.length > 0) {
      this.last_move = this.selected_ids[this.selected_answers.length - 1]
    } else {
      this.last_move = null
    }
  }

  unselect_last() {
    let piece = this.selected_answers[this.selected_answers.length - 1]
    if (!piece) { return }
    this.unselect_piece(piece) 
    if (this.shows_panel) { this.panel_update('code_display',this.selected_ids.join('')) }
  }

  reset_selected() {
    this.selected_answers.toReversed().forEach( 
      function(piece) { 
        this.unselect_piece(piece) 
      }.bind(this)
    )
    if (this.shows_panel) { this.panel_update('code_display',this.selected_ids.join('')) }
  }

  answer_positions() {
    let answer_pos = []
    this.answer_ids.forEach((id)=> {
      let p = this.piece_by_id(id)
      answer_pos.push((p.dat.row + 1) + ',' + (p.dat.column + 1))
    })
    return answer_pos
  }

  play_piece(piece) {
    if (!this.interactive) { return; }
console.log('1')
    //console.log(piece.dat.id,piece.dat.row + 1,piece.dat.column + 1)
    if (piece.dat.disabled) { return; }
    if (piece.dat.on_click) {
      piece.dat.on_click.call(this)
      return true;
    }
console.log('2')

    // Unclicked piece
    if (piece.dat.on == false) {
      if (this.selected_answers.length == this.answer_length) { return false; }
      this.select_piece(piece)
    }
    // Clicked piece
    else if (piece.dat.on == true) {
      // if ((!this.config.piece_labels) {
      //   this.select_piece(piece)
      // }
      // Clicked, no or max mutliples, so unclick and decrement
      if (this.last_move == piece.dat.id && piece.dat.decrementing) {
        this.unselect_piece(piece)
      }
      // Already Clicked, multiples allowed, not capped
      else if ((this.selected_answers.length < this.answer_length) && (this.config.multiples > 1) && (piece.dat.count < this.config.multiples)) {
        this.select_piece(piece)
      }
      // Clicked, no or max mutliples, so unclick and decrement
      else if (this.last_move == piece.dat.id) {
        this.unselect_piece(piece)
      }
      else {
        return false
      }
    }
    if (this.shows_panel) { this.panel_update('code_display',this.selected_ids.join('')) }
    this.check_board()
    return true
  }

  hightlight_piece(piece) {
    if (!this.config.piece_glow) { return false; }
    const xadj = piece.x + this.pieces.x - (this.piece_width/2) 
    const yadj = piece.y + this.pieces.y - (this.piece_height/1.5)

    piece.setToTop()
    piece.dat.overfx.shine = piece.postFX.addShine(0.55, 0.5, 7);
    piece.dat.overfx.glow = piece.preFX.addGlow("0xffffAA",5,0);
    piece.dat.overfx.glowtween = this.tweens.add({
        targets: piece.dat.overfx.glow,
        outerStrength: 15,
        yoyo: true,
        loop: -1,
        ease: 'sine.inout'
    });
    if (this.config.piece_labels) {
      piece.dat.overfx.label = this.add.text( xadj, yadj , piece.dat.positions.join(',') , 
        { 
          originX: 0,
          originY: 0,          
          fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
          fontSize: (this.piece_width/this.config.multiples) + 'px', 
          color: '#ffee55',
        }
      );
      piece.dat.overfx.label.preFX.addGlow("0x000000",5,0);
    }
    // piece.dat.old_tint = piece.tint
  }

  unhightlight_piece(piece) {
    if (!this.config.piece_glow) { return false; }
    piece.postFX.remove(piece.dat.overfx.shine);
    piece.dat.overfx.glowtween.remove()
    piece.preFX.remove(piece.dat.overfx.glow);
    piece.setToBack()
  }

  example_display() {
    let h = 50
    this.panel_add(
      'code_display',
      this.config.board_width, h,
      '#00FF00','Enter Code'
    )
  }
}