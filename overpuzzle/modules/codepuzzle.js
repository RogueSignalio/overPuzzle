class Codepuzzle extends Imagepuzzle {
  constructor (puzzle,overmaster) {
    let temp_config = {
      answer_length: 3,
      answers: [],
      multiples: 1,
      ...puzzle
    }
    super(temp_config,overmaster);
    this.answer_length = this.config.answer_length
    this.multiples = this.config.multiples

    this.selected_answers = []
    this.selected_ids = []
    this.answer_ids = []
    this.answer = null
  }

  start_puzzle (rows, columns) {
    this.slice_puzzle(rows,columns)
    this.pieces.postFX.addGlow("0x000000",5,0)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        let piece = this.grid[x][y]
        piece.dat = {}
        piece.dat.overfx = {}
        piece.dat.on = false
        piece.dat.count = 0
        piece.dat.positions = []
        piece.dat.decrementing = true
      }
    }
    if (!this.answer) {
      let myids = this.ids;
      for (let x = 0; x < this.answer_length; x++) {
        let pick = Phaser.Utils.Array.GetRandom(myids)
        this.answer_ids.push(pick)
        let index = myids.indexOf(pick);
        myids.splice(index, 1);
      }
      this.done_ids = this.answer_ids.join(',')
      console.log(this.done_ids)
    }
    this.last_move = null;
    this.shuffle_board();
  }

  start_play() {
    this.last_move = null;
    super.start_play()
  }

  // You probably need to override this method to check winning condition.
  check_board() {
    let done_ids = this.done_ids
    let check_ids = this.selected_ids.join(',')
    console.log('Done?', done_ids, check_ids,(done_ids == check_ids))
    if (done_ids == check_ids) {
      this.win_puzzle()
    }
  }

  select_piece(piece) {
    piece.dat.count++
    piece.dat.positions.push(this.selected_answers.length + 1)
    piece.dat.decrementing = false
    this.selected_answers.push(piece)
    this.selected_ids.push(piece.data.get('id'))
    this.last_move = piece.data.get('id')
    if (piece.dat.on == false) {
      this.hightlight_piece(piece)
    } else {
      piece.dat.overfx.label.text = piece.dat.positions.join(',')      
    }
    piece.dat.on = true
  }

  unselect_piece(piece) {
    piece.dat.count--
    piece.dat.positions.pop()
    piece.dat.decrementing = true

    this.selected_answers.pop() //piece.data.get('id'))
    this.selected_ids.pop()

    if (piece.dat.count == 0) {
      piece.dat.overfx.label.destroy()
      piece.dat.on = false
      this.unhightlight_piece(piece)
    } else {
      piece.dat.overfx.label.text = piece.dat.positions.join(',')            
    }

    if (this.selected_answers.length > 0) {
      this.last_move = this.selected_ids[this.selected_answers.length - 1]
    } else {
      this.last_move = null
    }
  }

  reset_selected() {
    this.selected_answers.toReversed().forEach( 
      function(piece) { 
        this.unselect_piece(piece) 
      }.bind(this)
    )
  }

  play_piece(piece) {
    if (!this.interactive) { return; }

    // Unclicked piece
    if (piece.dat.on == false) {
      if (this.selected_answers.length == this.answer_length) { return false; }
      this.select_piece(piece)
    }
    // Clicked piece
    else if (piece.dat.on == true) {
      // Clicked, no or max mutliples, so unclick and decrement
      if (this.last_move == piece.data.get('id') && piece.dat.decrementing) {
        this.unselect_piece(piece)
      }
      // Already Clicked, multiples allowed, not capped
      else if ((this.selected_answers.length < this.answer_length) && (this.config.multiples > 1) && (piece.dat.count < this.config.multiples)) {
        this.select_piece(piece)
      }
      // Clicked, no or max mutliples, so unclick and decrement
      else if (this.last_move == piece.data.get('id')) {
        this.unselect_piece(piece)
      }
      else {
        return false
      }
    }
    this.check_board()
    return true
  }

  hightlight_piece(piece) {
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
    piece.dat.overfx.label = this.add.text( xadj, yadj , piece.dat.positions.join(',') , 
      { 
        originX: 0,
        originY: 0,          
        fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
        fontSize: this.piece_width/2 + 'px', 
        color: '#ffee55',
      }
    );
    piece.dat.overfx.label.preFX.addGlow("0x000000",5,0);
    // piece.dat.old_tint = piece.tint
  }

  unhightlight_piece(piece) {
    piece.postFX.remove(piece.dat.overfx.shine);
    piece.dat.overfx.glowtween.remove()
    piece.preFX.remove(piece.dat.overfx.glow);
    piece.setToBack()
  }
}