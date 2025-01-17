// scrambleexample.js

class Scrambleexample extends Imagepuzzle {
  constructor (puzzle,overmaster) {
    let temp_config = {
      ...puzzle
    }
    super(temp_config,overmaster);
  }

  init() {
    super.init()
  }

  preload() {
    this.load.setPath(this.config.image_path);
    this.config.images.forEach( function(x,i) { 
      this.image_keys.push(`${this.config.key}_puzzle` + i)
      this.load.image(`${this.config.key}_puzzle` + i,x); 
    }.bind(this) )
    this.image_current = this.image_keys[this.image_index]
  }

  create() {
    this.slice_puzzle(this.config.rows,this.config.columns)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);
    this.last_move = null;
    this.shuffle_board();   
  }

  start_play() {
    console.log(this.answer_ids)
    console.log(md5(this.done_ids))
    setTimeout(function() { 
      this.renderer.snapshot(image => {
        // window.open(this.game.canvas.toDataURL()) }.bind(this),2000)
        const snap = this.textures.createCanvas('snap', image.width, image.height);
        snap.draw(0, 0, image);
        window.open(snap.canvas.toDataURL())
      })
    }.bind(this),2000)
  }

}

// op.current_puzzle.textures.get("rotate1_3_slice0").snapshot(image => {
//         const snap = op.current_puzzle.textures.createCanvas('snap', image.width, image.height);
//         snap.draw(0, 0, image);
//         window.open(snap.canvas.toDataURL())

// })
