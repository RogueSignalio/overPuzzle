class Codepuzzle extends Imagepuzzle {
  constructor (puzzle,overmaster) {
    super(puzzle,overmaster);
    this.answers = []
    this.answer = null
    this.answer_length = 4
    this.answer_ids = []
  }

  start_puzzle (rows, columns) {
    this.slice_puzzle(rows,columns)
    this.pieces.postFX.addGlow("0x000000",5,0)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        this.grid[x][y].dat = {}
        this.grid[x][y].dat.overfx = {}
        this.grid[x][y].dat.on = false
//        const fxShadow = this.grid[x][y].preFX.addShadow(0, 0, 0.06, 0.75, 0x000000, 4, 0.8);
//        this.grid[x][y].setTint('0xAAAADD')
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

  // check_puzzle() {

  // }

  // You probably need to override this method to check winning condition.
  check_board() {
    let done_ids = this.done_ids
    let check_ids = this.answers.join(',')
    console.log('Done?', done_ids, check_ids,(done_ids == check_ids))
    if (done_ids == check_ids) {
      this.win_puzzle()
    }
  }

  play_piece(piece) {
    if (!this.interactive) { return; }
    const xadj = piece.x + this.pieces.x - (this.piece_width/2) //this.pieces.x// + (this.piece_width/2)
    const yadj = piece.y + this.pieces.y - (this.piece_height/1.5)
    if (piece.dat.on == false) {
      if (this.answers.length == this.answer_length) { return; }
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
      piece.dat.overfx.label = this.add.text( xadj, yadj , this.answers.length + 1, 
        { 
          originX: 0,
          originY: 0,          
          fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
          fontSize: this.piece_width/2 + 'px', 
          color: '#ffee55',
        }
      );
//      piece.dat.overfx.label.preFX.addShadow(0, 0, 0.1, 2, 0x000000, 4, 0.8);        
//      piece.dat.overfx.label.setShadow(-2, -2, 'rgba(0,0,0,0.9)', 0.8);
      piece.dat.overfx.label.preFX.addGlow("0x000000",5,0);
      piece.dat.old_tint = piece.tint
//      piece.setTint("0x777777")
      piece.dat.on = true
      this.answers.push(piece.data.get('id'))
      this.last_move = piece.data.get('id')
      console.log(piece.data.values.id)
    }
    else if (piece.dat.on == true) {
      if (this.last_move == piece.data.get('id')) {
        piece.dat.overfx.label.destroy()
        piece.setTint(piece.dat.old_tint)
        piece.dat.on = false
        piece.postFX.remove(piece.dat.overfx.shine);
        piece.dat.overfx.glowtween.remove()
        piece.preFX.remove(piece.dat.overfx.glow);
        piece.setToBack()

        this.answers.pop(piece.data.get('id'))
        if (this.answers.length > 0) {
          this.last_move = this.answers[this.answers.length - 1]
        } else {
          this.last_move = null
        }
      }
    }
    this.check_board()
  }
}