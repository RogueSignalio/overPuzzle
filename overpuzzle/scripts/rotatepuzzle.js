class Rotatepuzzle extends Imagepuzzle {
  constructor (puzzle,overmaster) {
    let temp_config = {
      inc_angle: 90,
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
        this.grid[x][y].dat = {}
        this.grid[x][y].dat.overfx = {}
        this.grid[x][y].dat.on = false        
      }
    }
    this.last_move = null;
    setTimeout(function() { this.shuffle_board() }.bind(this),500);
  }

  shuffle_board() {
    const moves = [];
    let counter = 1;
    this.shuffles = this.config.rows * this.config.columns

    let rotations = []
    for (let rt = 1; rt <= (360/this.config.inc_angle);rt++) {
      rotations.push(rt)
    }
    let posi = [1,-1]
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        let r = Phaser.Utils.Array.GetRandom(rotations)
        let piece = this.grid[x][y]
        let new_angle = (this.config.inc_angle * r)  * (360/this.config.inc_angle - 1)
        let p = Phaser.Utils.Array.GetRandom(posi)
        setTimeout(function() { 
          this.rotate_piece_to(piece,new_angle * p,this.config.shuffle_speed, function(){
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
      duration: speed * 8,
      ease: 'power3'
    });
    tween.on('complete',func_on_complete,this)
  }

  rotate_piece(piece,speed=this.config.move_speed,func_on_complete=()=>{}) {
    let dest_angle = piece.angle + this.config.inc_angle //piece.angle

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
    this.rotate_piece(piece,this.config.shuffle_speed,()=>{ 
      this.interactive = true; 
      this.check_board() 
    })
    
    return true
  }

  check_board() {
    let check = true
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        if (this.grid[x][y].angle != 0) { check = false }
      }
    }
    if (check == true) {
      this.win_puzzle()
    }
  }
}