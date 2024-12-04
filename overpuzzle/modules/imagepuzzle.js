class Imagepuzzle extends Phaser.Scene {
  constructor (puzzle,overmaster) {
    super(puzzle.key);
    this.overmaster = overmaster
    this.config = {
      rows: 3,
      columns: 3,
      piece_width: 0,
      piece_height: 0,
      shuffles: null,
      shuffled_ids: null, // Set to an array desginating that the image has been pre-shuffled and to just cut and assign ids.
      shuffle_speed: 150, // 0 for instant shuffle
      move_speed: 150, // 0 for instant shuffle
      images: [],
      backgrounds: [],
      image_path: this.overmaster.config.image_path,
      audio_path: this.overmaster.config.audio_path,
      audio_files: [],
      auto_advance: true,
      table_width: this.overmaster.config.width,
      table_height: this.overmaster.config.height,
      board_width: 500,
      board_height: 500,
      on_check: function() { console.log('check!') }.bind(this),
      on_win: function(p) { console.log('won!') }.bind(this),
      on_move: function(p) { console.log('move!') }.bind(this),
      on_move_audio: function(p) { console.log('move audio!') }.bind(this),
      on_no_move_audio: function(p) { console.log('No move audio!') }.bind(this),
      on_win_audio: function(p) { console.log('win audio!') }.bind(this),
      on_start_audio: function(p) { console.log('start audio!') }.bind(this),
      ...puzzle
    }

    if (!this.config.shuffles) { this.config.shuffles = (this.config.rows * this.config.columns) * 2 }
    this.on_check = this.config.on_check
    this.on_win = this.config.on_win
    this.on_move = this.config.on_move
    this.on_move_audio = this.config.on_move_audio
    this.on_no_move_audio = this.config.on_no_move_audio
    this.on_win_audio = this.config.on_win_audio
    this.on_start_audio = this.config.on_start_audio
    this.image_index = 0
    this.image_current = null
    this.background_index = 0
    this.background_current = null
    this.image_keys = []
    this.background_keys = []
    this.ids = []
    this.slices = null
    this.pieces = null
    this.last_move = null
    this.interactive = false
    this.grid = []
    this.piece_ids = {}
    this.open_piece = null

    //  Loop through the image and create a new Sprite for each piece of the puzzle.
    for (let x = 0; x < this.config.rows; x++) {
      this.grid[x] = []
      for (let y = 0; y < this.config.columns; y++) {
        this.grid[x][y] = null
      }
    }

  }

  // If you want to append the preload, call super.preload() first in your override.
  preload () {
    this.load.setPath(this.config.image_path);
    this.config.backgrounds.forEach( function(x,i) { 
      this.background_keys.push(`${this.config.key}_background` + i)
      this.load.image(`${this.config.key}_background` + i,x); 
    }.bind(this) )
    this.config.images.forEach( function(x,i) { 
      this.image_keys.push(`${this.config.key}_puzzle` + i)
      this.load.image(`${this.config.key}_puzzle` + i,x); 
    }.bind(this) )
    this.config.audio_files.forEach( function(x,akey) { 
      this.audio_keys.push(akey)
      this.load.audio(akey,x); 
    }.bind(this) )
    this.image_current = this.image_keys[this.image_index]
    this.background_current = this.background_keys[this.background_index]
    // this.load.setPath('assets/games/sliding-puzzle/audio');
  }

  create () {
    window.solve = () => {
      this.nextRound();
    };
    this.start_puzzle(this.config.rows, this.config.columns);
  }

  set_next_puzzle() {
    this.image_index +=1
    this.background_index += 1

    if ((this.image_keys.length - 1) < this.image_index) { this.image_index = 0; }
    this.image_current = this.image_keys[this.image_index]
    if ((this.background_keys.length - 1) < this.background_index) { this.background_index = 0; }
    this.background_current = this.background_keys[this.background_index]
  }

  // Probably don't override this
  start_play() {
    this.interactive = true
    this.paused = false
  }

  // Probably need to override this, tho.
  start_puzzle (rows, columns) {
    this.slice_puzzle(rows,columns)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);
    this.last_move = null;
    this.on_start_audio.call(this)
    this.shuffle_board();
  }

  slice_puzzle (rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.interactive = false
    this.shuffles = this.config.shuffles
    this.texture = this.textures.getFrame(this.image_current);
    this.src_image_width  = this.texture.width;
    this.src_image_height = this.texture.height;
    this.image_width = this.config.board_width
    this.image_height = this.config.board_height;
    this.width_scale = this.config.board_width / this.src_image_width;
    this.height_scale = this.config.board_height / this.src_image_height;

    this.piece_width  = this.image_width / this.rows;
    this.piece_height = this.image_height / this.columns;
    let back = this.add.image(this.config.table_width/2, this.config.table_height/2, this.background_current);
    back.setDisplaySize(this.config.table_width,this.config.table_height)
    let xoffset = this.piece_width/2
    let yoffset = this.piece_height/2

    //  A Container to put the pieces in
    if (this.pieces) {
      this.pieces.removeAll(true);
    }
    else {
      //  The position sets the top-left of the container for the pieces to expand down from
      this.pieces = this.add.container(
        (this.config.table_width - this.image_width)/2, 
        (this.config.table_height - this.image_height)/2, 
      );
    }

    //  An array to put the texture slices in
    if (this.slices) {
      this.slices.forEach(slice => slice.destroy());
    }
    this.slices = [];

    let i = 0;
    //  Loop through the image and create a new Sprite for each piece of the puzzle.
    for (let x = 0; x < this.rows; x++) {
      for (let y = 0; y < this.columns; y++) {
        //  remove old textures
        // console.log(`slice${i}`, this.piece_width, this.piece_height)
        // console.log(this.width_scale, this.height_scale)
        let slice = this.textures.addDynamicTexture(`${this.config.key}_slice${i}`, this.piece_width, this.piece_height);
        slice.stamp(this.image_current, null, 0, 0, { 
          originX: (x / this.rows), originY: (y / this.columns), 
          scaleX: this.width_scale, scaleY: this.height_scale
        });
        this.slices.push(slice);

        let piece = this.add.image(x * this.piece_width + xoffset, y * this.piece_height + yoffset, `${this.config.key}_slice${i}`);
        piece.setData({
          row: x,
          column: y,
          source_row: x,
          source_column: y,
          id: i
        });
        piece.setInteractive();
        piece.on('pointerdown', () => this.move_piece(piece));
        this.pieces.add(piece);
        this.grid[x][y] = piece
        this.ids.push(i)
        i++;
      }
    }
    this.done_ids = this.ids.join(',')
  }

  shuffle_board() {
    const moves = [];
    const spacerCol = this.open_piece.data.get('column');
    const spacerRow = this.open_piece.data.get('row');

    if (spacerCol > 0 && this.last_move !== Phaser.DOWN) { moves.push(Phaser.UP); }
    if (spacerCol < this.columns - 1 && this.last_move !== Phaser.UP) { moves.push(Phaser.DOWN); }
    if (spacerRow > 0 && this.last_move !== Phaser.RIGHT) { moves.push(Phaser.LEFT); }
    if (spacerRow < this.rows - 1 && this.last_move !== Phaser.LEFT) { moves.push(Phaser.RIGHT); }

    //  Pick a move at random from the array
    this.last_move = Phaser.Utils.Array.GetRandom(moves);
    //  Then move the spacer into the new position
    switch (this.last_move) {
      case Phaser.UP:
        this.swap_piece(spacerRow, spacerCol - 1);
        break;
      case Phaser.DOWN:
        this.swap_piece(spacerRow, spacerCol + 1);
        break;
      case Phaser.LEFT:
        this.swap_piece(spacerRow - 1, spacerCol);
        break;
      case Phaser.RIGHT:
        this.swap_piece(spacerRow + 1, spacerCol);
        break;
    }
  }

  swap_piece (row, column,speed=this.config.shuffle_speed) {
    const piece = this.get_piece(row, column);
    const x = this.open_piece.x;
    const y = this.open_piece.y;

    piece.data.values.row = this.open_piece.data.values.row;
    piece.data.values.column = this.open_piece.data.values.column;
    this.open_piece.data.values.row = row;
    this.open_piece.data.values.column = column;
    this.grid[row][column] = this.open_piece
    this.grid[piece.data.values.row][piece.data.values.column] = piece

    this.open_piece.setPosition(piece.x, piece.y);

    if (this.shuffles > 0) {
      this.shuffles--;
      this.slide_piece(piece,x,y,speed,this.shuffle_board)
    }
    else {
      this.slide_piece(piece,x,y,speed,this.start_play)
    }
  }

  get_piece(row, column) {
    return this.grid[row][column]
  }

  slide_piece(piece, x, y, speed, func_on_complete) {
    if (speed == 0) {
      piece.setPosition(x, y);      
      func_on_complete.call(this)
    }
    else {
      const tween = this.tweens.add({
        targets: piece,
        x: x,
        y: y,
        duration: speed,
        ease: 'power3'
      });
      tween.on('complete',func_on_complete,this)
    }
  }

  // In general, you don't want to override this method.  Override 'play_piece'.
  move_piece(p) {
    let ret = this.play_piece(p)
    // console.log(ret)
    if (ret == true) { this.on_move.call(this,p) }
    if (ret == true) { this.on_move_audio.call(this,p) }
    else { this.on_no_move_audio.call(this,p) }
    // console.log(p)
    //  this.func_check_puzzle()
  }

  pause_puzzle() {
    this.paused = true
    this.interactive = false
  }

  resume_puzzle() {
    this.paused = false
    this.interactive = true
  }

  // You probably need to override this method to check winning condition.
  check_board() {
    let done_ids = this.done_ids
    let check_ids = []
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        check_ids.push(this.grid[x][y].data.values.id)
      }
    }    
    console.log('Done?', done_ids, check_ids.join(','),(done_ids == check_ids.join(',')))
    if (done_ids == check_ids.join(',')) {
      this.win_puzzle()
    }
  }

  // You probably need to override this method.  It should return true on succes and false on failure,
  // so it knows to play a sound.
  play_piece(piece) {
    if (!this.interactive) { return; }
    return true;
  }

  win_puzzle() {
    this.interactive = false;
    console.log('You win!')
    this.on_win.call(this)
    this.on_win_audio.call(this)
  }

}