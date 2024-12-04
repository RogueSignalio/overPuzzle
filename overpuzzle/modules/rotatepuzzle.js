class Rotatepuzzle extends Imagepuzzle {
  constructor (puzzle,overmaster) {
    super(puzzle,overmaster);
    this.answers = []
    this.answer = null
    this.answer_length = 4
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
      }
    }
    // if (!this.answer) {
    //   Phaser.Utils.Array.GetRandom()
    // }
    this.last_move = null;
    setTimeout(function() { this.shuffle_board() }.bind(this),500);
  }

  start_play() {
    this.last_move = null;
    this.interactive = true
    this.paused = false
    console.log('start!')
  }

  shuffle_board() {
    const moves = [];
    let counter = 1;
    this.shuffles = this.config.rows * this.config.columns

    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        let r = Phaser.Utils.Array.GetRandom([1,2,3,4])
        let piece = this.grid[x][y]
        let new_angle = 0
        if (r == 1) { new_angle = 270 }
        else if (r == 2) { new_angle = 450 }
        else if (r == 3) { new_angle = -270 }
        else if (r == 4) { new_angle = 360 }
        setTimeout(function() { 
          this.rotate_piece_to(piece,new_angle * 2,this.config.shuffle_speed, function(){
            this.shuffles--;
            if (this.shuffles < 1) { 
              this.start_play()
            }
          })
        }.bind(this),counter * 50);
        counter++;
      }
    }   
  }

  rotate_piece_to(piece,angle,speed,func_on_complete=()=>{}) {
    const tween = this.tweens.add({
      targets: piece,
      angle: angle,
      duration: speed * 2,
      ease: 'power3'
    });
    tween.on('complete',func_on_complete,this)
  }

  rotate_piece(piece,speed=this.config.move_speed,func_on_complete=()=>{}) {
    let dest_angle = piece.angle
    if (piece.angle == 0) { dest_angle = 90 }
    else if (piece.angle == 90) { dest_angle = 180 }
    else if (piece.angle == -180) { dest_angle = -90 }
    else if (piece.angle == -90) { dest_angle= 0 }
    const tween = this.tweens.add({
      targets: piece,
      angle: dest_angle,
      duration: speed,
      ease: 'power3'
    });
    tween.on('complete',func_on_complete,this)
  }

  play_piece(piece) {
    if (!this.interactive) { return; }
    this.interactive = false
    this.rotate_piece(piece,this.config.shuffle_speed,()=>{ this.interactive = true; console.log(piece.angle) })
    return true
  }

}