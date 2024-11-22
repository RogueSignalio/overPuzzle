class Slider extends Phaser.Scene {
  constructor (puzzle,master) {
    this.master = master
    var config = {
      rows: 0,
      columns: 0,
      piece_width: 0,
      piece_height: 0,
      shuffles: 10,
      shuffle_speed: 150, // 0 for instant shuffle
      photos: [],
      backgrounds: [],
      image_path: this.master.config.image_path,
      audio_path: this.master.config.audio_path,
      auto_advance: true,
      ...puzzle
    }
    var track = {
      pieces: [],
      spacer: null,
      last_move: null,
      slices: [],
      interactive: true,
    }
    //  The speed at which the pieces slide, and the tween they use
  }
// this.slideSpeed = 300;
// this.slideEase = 'power3';
//        this.shuffleEase = 'power1';
//    this.action = SlidingPuzzle.ALLOW_CLICK;

  preload () {
    this.load.setPath(this.config.asset_path);
    this.config.backgrounds.forEach( function(x,i) { this.load.image('background' + i,x); } )
    this.config.photos.forEach( function(x,i) { this.load.image('photos' + i,x); } )
    // this.load.setPath('assets/games/sliding-puzzle/audio');
    // this.load.audio('move', [ 'move.m4a', 'move.wav', 'move.ogg' ]);
    // this.load.audio('win', [ 'win.m4a', 'win.wav', 'win.ogg' ]);
  }

  create () {
    window.solve = () => {
      this.nextRound();
    };

    this.startPuzzle('puzzle1', 3, 3);
  }

  startPuzzle (key, rows, columns) {
    this.key = key;
    this.rows = rows;
    this.columns = columns;
    this.texture = this.textures.getFrame(this.key);
    this.image_width  = this.texture.width;
    this.image_height = this.texture.height;
    this.piece_width  = this.image_width / this.rows;
    this.piece_height = this.image_height / this.columns;
    this.add.image(400, 300, 'background');
//        this.add.image(512, 384, 'box-inside');

    //  A Container to put the pieces in
    if (this.pieces) {
      this.pieces.removeAll(true);
    }
    else {
      //  The position sets the top-left of the container for the pieces to expand down from
      this.pieces = this.add.container(100, 10);
    }

    //  An array to put the texture slices in
    if (this.slices) {
      this.slices.forEach(slice => slice.destroy());
      this.slices = [];
    }

    let i = 0;
    //  Loop through the image and create a new Sprite for each piece of the puzzle.
    for (let y = 0; y < this.columns; y++) {
      for (let x = 0; x < this.rows; x++) {
        //  remove old textures
        let slice = this.textures.addDynamicTexture(`slice${i}`, this.piece_width, this.piece_height);
        let orgx = 0 + (x / this.rows);
        let orgy = 0 + (y / this.columns);

        slice.stamp(key, null, 0, 0, { originX: orgx, orgY: orgy });

        this.slices.push(slice);

        let piece = this.add.image(x * this.piece_width, y * this.piece_height, `slice${i}`);
        piece.setOrigin(0, 0);

        //  The current row and column of the piece
        //  Store the row and column the piece _should_ be in, when the puzzle is solved
        piece.setData({
          row: x,
          column: y,
          actual_row: x,
          actual_column: y
        });

        this.piece.setInteractive();
        this.piece.on('pointerdown', () => this.checkPiece(this.piece));
        this.pieces.add(this.piece);
        i++;
      }
    }

    this.empty = this.pieces.getAt(this.pieces.length - 1);
    this.empty.alpha = 0;
    this.last_move = null;

//    this.shufflePieces();
  }

}