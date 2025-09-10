//===========================================================================
// OverPuzzle
//---------------------------------------------------------------------------
// Authors: BlackRogue01 (dallen@trammelventures.com)
// Copyright: RogueSignal.io, wwww.roguesignal.io, 2024
//---------------------------------------------------------------------------
// 
//  See README.txt
//===========================================================================
class Imagepuzzle extends Phaser.Scene {
  constructor (puzzle,overmaster) {
    super(puzzle.key);
    this.overmaster = overmaster
    this.key = puzzle.key
    this.config = {
      solved: false,
      rows: 3,
      columns: 3,
      piece_width: 0,
      piece_height: 0,
      shuffles: null,
      shuffle_speed: 150, // 0 for instant shuffle
      move_speed: 250, // 0 for instant shuffle
      images: [],
      backgrounds: [],
      background_tint: null,
      image_path: this.overmaster.config.image_path,
      audio_path: this.overmaster.config.audio_path,
      sounds: {},
      auto_advance: true,
      table_width: this.overmaster.config.width,
      table_height: this.overmaster.config.height,
      board_width: 500,
      board_height: 500,
      game_height: this.overmaster.config.height,
      game_width: this.overmaster.config.width,
      open_piece: null,
      piece_ids: null,
      table_xoffset: 0,
      table_yoffset: 0,
      answers: null, // Hmmm ...
      answer_hash: null, 
      solve_ids: null, // Solve ids are a non-unique designator for puzzles where pieces are interchangeable. Or match in matching games.
//      shuffled_ids: null, // Set to an array desginating that the image has been pre-shuffled and to just cut and assign ids.
      no_audio_keys: [],
      // Callbacks
      on_check: function() { }.bind(this), //console.log('Check win...') }.bind(this),
      on_win: function() { }.bind(this), //console.log('You won!') }.bind(this),
      on_move: function(p) { }.bind(this), //console.log(`Move: ${this.move_count}`) }.bind(this),
      on_ready: function() { }.bind(this), //console.log('Puzzle ready!')}.bind(this),
      pre_win: null,
      //function() { console.log('You handle the win...') }.bind(this),
      // Audio functions to override.
      on_move_audio: function(p) { this.play_sound_unqiue('move',{ detune: 300 }) }.bind(this),
      on_no_move_audio: function(p) { this.play_sound_unqiue('no_move',{ detune: 300 }) }.bind(this),
      on_win_audio: function(p) { this.play_sound('win') }.bind(this),
      on_start_audio: function(p) { this.play_sound('start') }.bind(this),
      ...puzzle
    }

    if (this.config.shuffles == null) { this.config.shuffles = (this.config.rows * this.config.columns) * 2 }
    this.panel_images = {}
    this.on_check = this.config.on_check
    this.on_win = this.config.on_win
    this.on_move = this.config.on_move
    this.on_ready = this.config.on_ready    
    this.pre_win = this.config.pre_win    
    this.on_move_audio = this.config.on_move_audio
    this.on_no_move_audio = this.config.on_no_move_audio
    this.on_win_audio = this.config.on_win_audio
    this.on_start_audio = this.config.on_start_audio
    this.piece_ids = this.config.piece_ids
  }

  init() {
    this.panels = {}
    this.move_count = 0
    this.image_index = 0
    this.image_current = null
    this.background_index = 0
    this.background_current = null
    this.tiles_keys = []
    this.image_keys = []
    this.audio_keys = []
    this.background_keys = []
    this.ids = []
    this.slices = null
    this.pieces = null
    this.last_move = null
    this.interactive = false
    this.grid = []
    this.open_piece = null
    this.hashing = false

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
    // this.config.tiles.forEach( function(x,i) { 
    //   this.tiles_keys.push(`${this.config.key}_tiles` + i)
    //   this.load.image(`${this.config.key}_tiles` + i,x); 
    // }.bind(this) )
    if (this.config.images_base64) {
      this.config.images_base64.forEach( function(x,i) { 
        this.image_keys.push(`${this.config.key}_puzzle` + i)
        this.load.image(`${this.config.key}_puzzle` + i,x); 
      }.bind(this) )
    } else {
      this.config.images.forEach( function(x,i) { 
        this.image_keys.push(`${this.config.key}_puzzle` + i)
        this.load.image(`${this.config.key}_puzzle` + i,x); 
      }.bind(this) )
    }
    this.image_current = this.image_keys[this.image_index]
    this.background_current = this.background_keys[this.background_index]

    this.load.setPath(this.config.audio_path);
    Object.entries(this.config.sounds).forEach(([key, value]) => {
      if (value) { 
        this.load.audio(`${this.key}_${key}_snd`,value);
      }
    })
  }

  create () {
    Object.entries(this.config.sounds).forEach(([key, value]) => { 
      if (value) { 
        this.audio_keys.push(key)
        this.audio_engine.add_sound(`${this.key}_${key}_snd`,this.key)
      }
    })
    window.solve = () => {
      this.nextRound();
    };
    this.on_start_audio.call(this)
    this.start_puzzle(this.config.rows, this.config.columns);
  }

  play_sound(key,options={}) {
    this.audio_engine.play_sound(`${this.key}_${key}_snd`,options)
  }
  play_sound_unqiue(key,options={}) {
    this.audio_engine.play_sound_unique(`${this.key}_${key}_snd`,options)
  }

  stop_sounds() {
    this.audio_engine.stop_bank(this.key)
  }

  set_next_puzzle() {
    this.image_index +=1
    this.background_index += 1

    if ((this.image_keys.length - 1) < this.image_index) { this.image_index = 0; }
    this.image_current = this.image_keys[this.image_index]
    if (this.background_keys.length > 0) {
      if ((this.background_keys.length - 1) < this.background_index) { this.background_index = 0; }
      this.background_current = this.background_keys[this.background_index]
    }
  }

  // Probably don't override this
  start_play() {
    this.interactive = true
    this.paused = false
    this.last_move = null;
    this.on_ready.call(this)
  }

  // Probably need to override this, tho.
  start_puzzle (rows, columns) {
    this.slice_puzzle(rows,columns)
    this.open_piece = this.pieces.getAt(this.pieces.length - 1);
    this.last_move = null;
    this.shuffle_board();
  }

  layout_puzzle(layout={}) {
    if (!this.piece_ids) { this.piece_ids = [] }
    this.grid = []

    if (this.background_current) {
      this.background = this.add.image(this.config.game_width/2, this.config.game_height/2, this.background_current);
      this.background.setDisplaySize(this.config.table_width,this.config.table_height)
      if (this.config.background_tint) { this.background.setTint(this.config.background_tint) }
    }

    this.pieces = this.add.container(
      (this.config.game_width - this.config.table_width)/2, 
      (this.config.game_height - this.config.table_width)/2, 
    );

    Object.entries(layout).forEach(function(p,i) {
      let x = p[1][0]
      let y = p[1][1]
      let piece = this.add.image(x, y, `${this.config.key}_puzzle` + p[0]);
      if (p[1][2] != undefined) { piece.angle = p[1][2]}
      if (!this.piece_ids[x]) { this.piece_ids[x] = [] }
      if (!this.grid[x]) { this.grid[x] = [] }
      this.piece_ids[x][y] = i
      let id = this.piece_ids[x][y]

      piece.dat = {
        row: x,
        column: y,
        source_row: x,
        source_column: y,
        id: id,
        solve_id: id,
        overfx: {},
        on: false,
        count: 0,
        positions: [],
        decrementing: true,
      }
      if (this.config.solve_ids) {
        piece.dat.solve_id = this.config.solve_ids[x][y]
      }

      piece.setInteractive();
      piece.input.cursor = 'pointer';
      piece.on('pointerdown', () => this.move_piece(piece));
      this.pieces.add(piece);
      this.grid[x][y] = piece
      this.ids.push(id)
      i++;
    }.bind(this))
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

    if (this.background_current) {
      this.background = this.add.image(this.config.game_width/2, this.config.game_height/2, this.background_current);
      this.background.setDisplaySize(this.config.table_width,this.config.table_height)
      if (this.config.background_tint) { this.background.setTint(this.config.background_tint) }
    }

    this.piece_width  = this.image_width / this.columns;
    this.piece_height = this.image_height / this.rows;
    let xoffset = this.piece_width/2
    let yoffset = this.piece_height/2

    //  A Container to put the pieces in
    if (this.pieces) {
      this.pieces.removeAll(true);
    }
    else {
      this.pieces = this.add.container(
        (this.config.game_width - this.image_width)/2, 
        (this.config.game_height - this.image_height)/2, 
      );
    }

    //  An array to put the texture slices in
    if (this.slices) {
      this.slices.forEach(slice => slice.destroy());
    }
    this.slices = [];

    let i = 0;
    if (!this.piece_ids) { this.piece_ids = [] }

    //  Loop through the image and create a new Sprite for each piece of the puzzle.
    for (let x = 0; x < this.rows; x++) {
      if (!this.piece_ids[x]) { this.piece_ids[x] = [] }

      for (let y = 0; y < this.columns; y++) {
        let slice = this.textures.addDynamicTexture(`${this.config.key}_slice${i}`, this.piece_width, this.piece_height);
        slice.stamp(this.image_current, null, 0, 0, { 
          originX: (y / this.columns), originY: (x / this.rows), 
          scaleX: this.width_scale, scaleY: this.height_scale
        });
        // console.log(i,x,y,':',(y * this.piece_width),(x * this.piece_height),(y / this.columns),(x / this.rows))

        this.slices.push(slice);

        let piece = this.add.image((y * this.piece_width) + xoffset, (x * this.piece_height) + yoffset, `${this.config.key}_slice${i}`);
        
        if (!this.piece_ids[x][y]) { this.piece_ids[x][y] = i }
        let id = this.piece_ids[x][y]

        piece.dat = {
          row: x,
          column: y,
          source_row: x,
          source_column: y,
          id: id,
          solve_id: id,
        }
        if (this.config.solve_ids) {
          piece.dat.solve_id = this.config.solve_ids[x][y]
        }

        piece.setInteractive();
        piece.input.cursor = 'pointer';
        piece.on('pointerdown', () => this.move_piece(piece));
        this.pieces.add(piece);
        this.grid[x][y] = piece
        this.ids.push(id)
        i++;
      }
    }
    if (this.config.answers) {
      this.answer = this.check_merge(this.config.answers)
    } else if (this.config.answer_hash) {
      this.answer = this.config.answer_hash
      this.hashing = true
    } else {
      if (!this.config.solve_ids) {
        this.answer = this.check_merge(this.ids)
      } else {
        this.answer = this.check_merge(this.config.solve_ids)
      }
    }
  }

  shuffle_board() {
    if (this.config.shuffles < 1) { this.start_play(); return true; }
    if (this.config.solved == true) { this.win_puzzle(); return true; }
    const moves = [];
    const spacerCol = this.open_piece.dat.column
    const spacerRow = this.open_piece.dat.row

    if (spacerCol > 0 && this.last_move !== Phaser.DOWN) { moves.push(Phaser.UP); }
    if (spacerCol < this.columns - 1 && this.last_move !== Phaser.UP) { moves.push(Phaser.DOWN); }
    if (spacerRow > 0 && this.last_move !== Phaser.RIGHT) { moves.push(Phaser.LEFT); }
    if (spacerRow < this.rows - 1 && this.last_move !== Phaser.LEFT) { moves.push(Phaser.RIGHT); }

    //  Pick a move at random from the array
    this.last_move = Phaser.Utils.Array.GetRandom(moves);
    //  Then move the spacer into the new position
    switch (this.last_move) {
      case Phaser.UP:
        this.swap_piece(spacerRow, spacerCol - 1); break;
      case Phaser.DOWN:
        this.swap_piece(spacerRow, spacerCol + 1); break;
      case Phaser.LEFT:
        this.swap_piece(spacerRow - 1, spacerCol); break;
      case Phaser.RIGHT:
        this.swap_piece(spacerRow + 1, spacerCol); break;
    }
  }

  swap_piece (row, column,speed=this.config.shuffle_speed) {
    const piece = this.get_piece(row, column);
    const x = this.open_piece.x;
    const y = this.open_piece.y;

    piece.dat.row = this.open_piece.dat.row;
    piece.dat.column = this.open_piece.dat.column;
    this.open_piece.dat.row = row;
    this.open_piece.dat.column = column;
    this.grid[row][column] = this.open_piece
    this.grid[piece.dat.row][piece.dat.column] = piece

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

  piece_by_id(id) {
    let piece = null
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        if (this.grid[x][y].dat.id == id) { return this.grid[x][y] }
      }
    }
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
    if (!this.interactive) { return; }
    let ret = this.play_piece(p)
    if (ret == true) { 
      this.move_count++
      this.on_move.call(this,p)
      if (this.config.no_audio_keys.indexOf(p.dat.id) < 0) {
        this.on_move_audio.call(this)
      }
    }
    else { 
      if (this.config.no_audio_keys.indexOf(p.dat.id) < 0) {
        this.on_no_move_audio.call(this)
      } 
    }
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

  check_ids() {
    let check_ids = []
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        check_ids.push(this.grid[x][y].dat.solve_id)
      }
    }
    return check_ids
  }

  merge_ids(chr=',') {
    return this.check_ids().join(chr)
  }

  // You probably need to override this method to check winning condition.
  check_board() {
    let ck_ids = this.check_ids()
//console.log('Answer' + this.answer)
    if (this.answer == this.check_merge(ck_ids)) {
      this.win_puzzle()
    } else {
      //console.log('Done?', done_ids, check_ids.join(','),(done_ids == check_ids.join(',')))      
    }
  }

  check_merge(ids=[]) {
    let cm = ids.join(',')
// console.log(cm)
    if (this.hashing) { cm = md5(cm); }
// console.log(cm)
    return cm;
  }

  // You probably need to override this method.  It should return true on succes and false on failure,
  // so it knows to play a sound.
  play_piece(piece) {
    return true;
  }

  win_puzzle() {
    if (this.pre_win) {
      this.pre_win.call(this)
    } else {
      this.do_win()
    }
  }

  do_win() {
    this.interactive = false;
    this.glow_puzzle()
    this.on_win.call(this)
    this.on_win_audio.call(this)
  }

  panel_add(tag,w,h,color='#00FF00',text='',xoffset=0,yoffset=0,xpush=null) {
    let tp = this.add.text( (this.config.board_width/2), h/2 , text , { 
      // originX: 0.5, originY: 0.5,
      fontFamily: 'Share Tech Mono',
      fontSize: (h - 4) + 'px', 
      color: color,
    });
    tp.setOrigin(0.5,0.5)

    var ip;
    if (this.panel_images[tag]) {
      ip = this.add.image(0,0,tag)
    } else {
      let gg = this.add.graphics();
      gg.fillStyle(0x000000, 1);
      gg.fillRoundedRect(0, 0, w, h, 20);
      ip = gg;
//      gg.generateTexture(tag, w, h);
      // ip = this.add.image(0, 0, tag, { originX: 1, originY: 1 });
      // this.panel_images[tag] = ip
      // gg.destroy()
    }
    this.panels[tag] = this.add.container(
      (this.config.game_width - this.image_width)/2 + yoffset, 
      (this.config.game_height - this.image_height)/2 - h + xoffset, 
    )
    this.panels[tag].add(ip)
    this.panels[tag].add(tp)
    this.panels[tag].postFX.addGlow("0x777777",3,0);
    this.panels[tag].pz_background = ip
    this.panels[tag].pz_text = tp
    if (xpush == null) {
      let pyh = this.pieces.y - (this.panels[tag].y + h)
      let nh = pyh < 20 ? (pyh * -1) + 20 : 0
      this.pieces.y += nh
    } else {
      this.pieces.y += xpush
    }
//    Phaser.Display.Align.In.Center(tp, ip); //this.panels[tag].pz_background);    
  }

  panel_update(tag,text) {
    this.panels[tag].pz_text.text = text
    // Phaser.Display.Align.In.Center(text, this.panels[tag].pz_background);    
  }

  glow_puzzle() {
    this.pieces.postFX.addShine(0.55, 0.5, 7);
    if (this.background) { this.background.postFX.addShine(0.55, 0.5, 7); }
    let glow = this.pieces.postFX.addGlow("0xffffAA",5,0);
    this.tweens.add({
        targets: glow,
        outerStrength: 15,
        yoyo: true,
        loop: -1,
        ease: 'sine.inout'
    });
  }
}

// Blueimp MD5 hash: https://github.com/blueimp/JavaScript-MD5
!function(n){"use strict";function d(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function f(n,t,r,e,o,u){return d((u=d(d(t,n),d(e,u)))<<o|u>>>32-o,r)}function l(n,t,r,e,o,u,c){return f(t&r|~t&e,n,t,o,u,c)}function g(n,t,r,e,o,u,c){return f(t&e|r&~e,n,t,o,u,c)}function v(n,t,r,e,o,u,c){return f(t^r^e,n,t,o,u,c)}function m(n,t,r,e,o,u,c){return f(r^(t|~e),n,t,o,u,c)}function c(n,t){var r,e,o,u;n[t>>5]|=128<<t%32,n[14+(t+64>>>9<<4)]=t;for(var c=1732584193,f=-271733879,i=-1732584194,a=271733878,h=0;h<n.length;h+=16)c=l(r=c,e=f,o=i,u=a,n[h],7,-680876936),a=l(a,c,f,i,n[h+1],12,-389564586),i=l(i,a,c,f,n[h+2],17,606105819),f=l(f,i,a,c,n[h+3],22,-1044525330),c=l(c,f,i,a,n[h+4],7,-176418897),a=l(a,c,f,i,n[h+5],12,1200080426),i=l(i,a,c,f,n[h+6],17,-1473231341),f=l(f,i,a,c,n[h+7],22,-45705983),c=l(c,f,i,a,n[h+8],7,1770035416),a=l(a,c,f,i,n[h+9],12,-1958414417),i=l(i,a,c,f,n[h+10],17,-42063),f=l(f,i,a,c,n[h+11],22,-1990404162),c=l(c,f,i,a,n[h+12],7,1804603682),a=l(a,c,f,i,n[h+13],12,-40341101),i=l(i,a,c,f,n[h+14],17,-1502002290),c=g(c,f=l(f,i,a,c,n[h+15],22,1236535329),i,a,n[h+1],5,-165796510),a=g(a,c,f,i,n[h+6],9,-1069501632),i=g(i,a,c,f,n[h+11],14,643717713),f=g(f,i,a,c,n[h],20,-373897302),c=g(c,f,i,a,n[h+5],5,-701558691),a=g(a,c,f,i,n[h+10],9,38016083),i=g(i,a,c,f,n[h+15],14,-660478335),f=g(f,i,a,c,n[h+4],20,-405537848),c=g(c,f,i,a,n[h+9],5,568446438),a=g(a,c,f,i,n[h+14],9,-1019803690),i=g(i,a,c,f,n[h+3],14,-187363961),f=g(f,i,a,c,n[h+8],20,1163531501),c=g(c,f,i,a,n[h+13],5,-1444681467),a=g(a,c,f,i,n[h+2],9,-51403784),i=g(i,a,c,f,n[h+7],14,1735328473),c=v(c,f=g(f,i,a,c,n[h+12],20,-1926607734),i,a,n[h+5],4,-378558),a=v(a,c,f,i,n[h+8],11,-2022574463),i=v(i,a,c,f,n[h+11],16,1839030562),f=v(f,i,a,c,n[h+14],23,-35309556),c=v(c,f,i,a,n[h+1],4,-1530992060),a=v(a,c,f,i,n[h+4],11,1272893353),i=v(i,a,c,f,n[h+7],16,-155497632),f=v(f,i,a,c,n[h+10],23,-1094730640),c=v(c,f,i,a,n[h+13],4,681279174),a=v(a,c,f,i,n[h],11,-358537222),i=v(i,a,c,f,n[h+3],16,-722521979),f=v(f,i,a,c,n[h+6],23,76029189),c=v(c,f,i,a,n[h+9],4,-640364487),a=v(a,c,f,i,n[h+12],11,-421815835),i=v(i,a,c,f,n[h+15],16,530742520),c=m(c,f=v(f,i,a,c,n[h+2],23,-995338651),i,a,n[h],6,-198630844),a=m(a,c,f,i,n[h+7],10,1126891415),i=m(i,a,c,f,n[h+14],15,-1416354905),f=m(f,i,a,c,n[h+5],21,-57434055),c=m(c,f,i,a,n[h+12],6,1700485571),a=m(a,c,f,i,n[h+3],10,-1894986606),i=m(i,a,c,f,n[h+10],15,-1051523),f=m(f,i,a,c,n[h+1],21,-2054922799),c=m(c,f,i,a,n[h+8],6,1873313359),a=m(a,c,f,i,n[h+15],10,-30611744),i=m(i,a,c,f,n[h+6],15,-1560198380),f=m(f,i,a,c,n[h+13],21,1309151649),c=m(c,f,i,a,n[h+4],6,-145523070),a=m(a,c,f,i,n[h+11],10,-1120210379),i=m(i,a,c,f,n[h+2],15,718787259),f=m(f,i,a,c,n[h+9],21,-343485551),c=d(c,r),f=d(f,e),i=d(i,o),a=d(a,u);return[c,f,i,a]}function i(n){for(var t="",r=32*n.length,e=0;e<r;e+=8)t+=String.fromCharCode(n[e>>5]>>>e%32&255);return t}function a(n){var t=[];for(t[(n.length>>2)-1]=void 0,e=0;e<t.length;e+=1)t[e]=0;for(var r=8*n.length,e=0;e<r;e+=8)t[e>>5]|=(255&n.charCodeAt(e/8))<<e%32;return t}function e(n){for(var t,r="0123456789abcdef",e="",o=0;o<n.length;o+=1)t=n.charCodeAt(o),e+=r.charAt(t>>>4&15)+r.charAt(15&t);return e}function r(n){return unescape(encodeURIComponent(n))}function o(n){return i(c(a(n=r(n)),8*n.length))}function u(n,t){return function(n,t){var r,e=a(n),o=[],u=[];for(o[15]=u[15]=void 0,16<e.length&&(e=c(e,8*n.length)),r=0;r<16;r+=1)o[r]=909522486^e[r],u[r]=1549556828^e[r];return t=c(o.concat(a(t)),512+8*t.length),i(c(u.concat(t),640))}(r(n),r(t))}function t(n,t,r){return t?r?u(t,n):e(u(t,n)):r?o(n):e(o(n))}"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:n.md5=t}(this);
