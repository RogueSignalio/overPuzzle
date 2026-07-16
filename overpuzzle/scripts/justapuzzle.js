//===========================================================================
// OverPuzzle
//---------------------------------------------------------------------------
// Authors: BlackRogue01 (dallen@trammelventures.com)
// Copyright: RogueSignal.io, wwww.roguesignal.io, 2024
//---------------------------------------------------------------------------
// 
//  See README.txt
//===========================================================================
class Justapuzzle extends Codepuzzle {
  constructor (puzzle,overmaster) {
    let temp_config = {
      piece_labels: false,
      ...puzzle
    }
    super(temp_config,overmaster);
  }

  start_puzzle (rows, columns) {
    this.slice_puzzle(rows,columns)
    const bounds = this.pieces.getBounds();

// Set size manually if needed
    this.pieces.setSize(bounds.width, bounds.height);
     // Create a background graphic (e.g., red, 300x300)
    const bg = this.add.graphics();
    // bg.lineStyle(2, 0xaaaaaa, 1);
    // bg.strokeRect(0, 0, bounds.width, bounds.height);
    // // bg.fillRect(0, 0, );
    // // Add the background to the container
    // // Place this as the first item so it renders behind other children
    // this.pieces.add(bg);
    const grid = this.add.grid(
        this.pieces.x - this.piece_width/6, this.pieces.y - this.piece_height/6,          // x, y position
        bounds.width, bounds.height,          // width, height of the grid area
        this.piece_width, this.piece_height,            // cell width, cell height
        0x000000, 0,     // fill color, fill alpha
        0x777777, 0.5      // outline color, outline alpha
    );

// Add to container
    this.pieces.add(grid);

    this.pieces.setInteractive(
      new Phaser.Geom.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height), 
      Phaser.Geom.Rectangle.Contains
    );
    this.pieces.input.cursor = 'pointer';
    this.pieces.on('pointerdown', (pointer) => {
      console.log('Container clicked at', pointer.x, pointer.y);
      this.put_piece(pointer.x,pointer.y)
    });

    this.open_piece = this.pieces.getAt(this.pieces.length - 1);

    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        let piece = this.grid[x][y]
        piece.dat.overfx = {}
        piece.dat.on = false
        piece.dat.positions = []
        piece.dat.decrementing = true
        piece.dat.count = 0
//        piece.tint = '0x000000'
      }
    }
//    this.shuffle_board();
    this.shelf_pieces();
  }

  put_piece(x,y) {
    const cx = x - this.pieces.x 
    const cy = y - this.pieces.y    
    const nc = this.get_x_column(cx)
    const nr = this.get_y_row(cy)
console.log(cx,cy,nc,nr,this.last_move,this.grid)
    if (this.last_move != undefined) {
      let piece = this.piece_by_id(this.last_move)
      // const piece = this.get_piece(nc, nr);
console.log(piece)
      piece.dat.row = nr
      piece.dat.column = nc
      this.grid[nr][nc] = piece
      this.slide_piece(piece,this.get_column_x(nc),this.get_row_y(nr),this.config.shuffle_speed,function(){})
      this.unselect_piece(piece)
    }
  }

  shelf_pieces() {
    let new_row = this.config.rows + 1
    this.grid[new_row] = []
    let current_col = 0

    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        const piece = this.get_piece(x, y);
        piece.dat.row = new_row; //this.open_piece.dat.row;
        piece.dat.column = current_col; //this.open_piece.dat.column;
        this.grid[piece.dat.row][piece.dat.column] = piece
        this.slide_piece(piece,this.get_column_x(current_col),this.get_row_y(new_row),this.config.shuffle_speed,function(){})
        current_col++;
      }
    }
    this.start_play()
  }

  play_piece(piece) {
    if (this.interactive == false) { return false; }

    if ((this.last_move == null) || (piece.dat.id == this.last_move)) {
      // Unclicked piece
      if (piece.dat.on == false) {
        this.select_piece(piece)
        this.open_piece = this.piece_by_id(this.last_move)  
      }
      // Clicked piece
      else if (piece.dat.on == true) {
        this.unselect_piece(piece)
        this.last_move = null
      }
    } else {
      this.unselect_piece(this.open_piece)
      this.play_swap_piece(piece.dat.row , piece.dat.column, 200); //, this.check_board );
      this.last_move = null
    }
    return true
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
    let check_ids = []
    for (let x = 0; x < this.config.rows; x++) {
      for (let y = 0; y < this.config.columns; y++) {
        check_ids.push(this.grid[x][y].dat.solve_id)
      }
    }    
    if (this.answer == this.check_merge(check_ids)) {
      this.win_puzzle()
    } else {
      //console.log('Done?', done_ids, check_ids.join(','),(done_ids == check_ids.join(',')))      
    }
  }

  play_swap_piece (row, column,speed=this.config.move_speed) {
    const piece = this.get_piece(row, column);
    const x = this.open_piece.x;
    const y = this.open_piece.y;

    piece.dat.row = this.open_piece.dat.row;
    piece.dat.column = this.open_piece.dat.column;
    this.open_piece.dat.row = row;
    this.open_piece.dat.column = column;
    this.grid[row][column] = this.open_piece
    this.grid[piece.dat.row][piece.dat.column] = piece

 //   this.open_piece.setPosition(piece.x, piece.y);
    this.slide_piece(this.open_piece,piece.x,piece.y,speed,()=>{})
    this.slide_piece(piece,x,y,speed,this.check_board)
  }

  hightlight_piece(piece) {
    if (!this.config.piece_glow) { return false; }
    const xadj = piece.x + this.pieces.x - (this.piece_width/2) 
    const yadj = piece.y + this.pieces.y - (this.piece_height/1.5)

    piece.setToTop()
    piece.dat.overfx.glow = piece.postFX.addGlow("0xffffAA",5,0);
    // piece.dat.overfx.glowtween = this.tweens.add({
    //     targets: piece.dat.overfx.glow,
    //     outerStrength: 15,
    //     yoyo: true,
    //     loop: -1,
    //     ease: 'sine.inout'
    // });
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
//      piece.dat.overfx.label.preFX.addGlow("0x000000",5,0);
    }
    // piece.dat.old_tint = piece.tint
  }

  unhightlight_piece(piece) {
    if (!this.config.piece_glow) { return false; }
    // piece.dat.overfx.glowtween.remove()
    piece.postFX.remove(piece.dat.overfx.glow);
    piece.setToBack()
  }
}