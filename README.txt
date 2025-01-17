OverPuzzle - Easy peasy Javascript image puzzle engine.
 ---------------------------------------------------------------------------
 Authors: BlackRogue01 (donovan@roguesignal.io)
 Copyright: RogueSignal.io, wwww.roguesignal.io, 2024
 Version: 0.91
---------------------------------------------------------------------------

Demo: https://roguesignalio.github.io/overPuzzle/

OverPuzzle is another in a series of over[Something] Javascript libraries created by RogueSignal.io for our own game development that made sense to keep as a distinct, re-usable, and flexible development component.

OverPuzzle provides web developers the ability to drop different small puzzle games into their own webapp.  Currently, we support a sliding image puzzle, a code "keypad" puzzle, and a rotating piece puzzle.  Firing up the demo above will be helpful in understanding what the puzzle types offered here are.  We are working on a couple more puzzle types, which are a combo lock spinner puzzle and a slot puzzle (move pieces to different locations).

Some of these puzzle types are not solvable by the presented information, such as the code puzzles.  The keypad solution must be found by external means, provided by you to the user.  In the demo, the solution code will be provided with the puzzle.

OverPuzzle allows a fairly high degree of customization of the puzzles, as well as event hooks to integrate into your client or serve side solutions.  This makes it fairly easy for any of the puzzles to be dropped into any JS enable interface and then integrated into your own code to provide customized behavior on, for example, a piece "move" (update a move counter) or when the player wins (fire off some FX from overFX, perhaps...).

Install:
  TBD

How to use:
    In HTML:  <div id="overpuzzle"></div>
    
    op = new OverPuzzle(config)

    Config settings and defaults:
      debug: false,   // Turns debug console logs on.  Currently un-used
      audio_on: true, // Turns on audio, default is on
      preload: false, // Disable dynamic loading of libraries.  They must be bundled or preloaded in some other fashion!
      volume: 0.5,    // Default audio volume
      image_path: './overpuzzle/assets/',     // path of image assets
      audio_path: './overpuzzle/audio/',      // path of audio assets
      modules_path: './overpuzzle/scripts/',  // path of puzzle "plugin" scripts
      width: window.innerWidth,   // Game engine width in pixels
      height: window.innerHeight, // Game engine height in pixels
      audio_engine: null,         // Provide a compatible audio engine, such as an instance of overAudio
      background: '0x000000',     // Background color, if visible
      transparent: true,          // Transparent or not background
      parent: 'overpuzzle',

  Example:
      op = new OverPuzzle({
          width: 624 ,
          height: 540,
          transparent: true,      
      })

  Once you have the master OverPuzzle instance, you instantiate puzzles inside of it.  Currently, only one puzzle can be created at a time.  The index.html provides good reference for examples. Here is one:

    op.add_puzzle(unique_key, config, [on_ready_callback])

    op.add_puzzle('slide1', { 
        type: 'slidepuzzle', 
        backgrounds: [ 'myslideback.jpg'], 
        images: ['myslide.jpg'],
        rows: 3,
        columns: 3,
        shuffle_speed: 50,
        board_width: puzzle_width,
        board_height: puzzle_height,
        sounds: {
          move: 'slidemove1.mp3',
          start: 'slidestart1.mp3',
          win: 'slidewon1.mp3',
          no_move: 'slidenomove1.mp3',
        },
        on_win: ()=> { op.alert("You won!"); },
    })

  Each puzzle type has some unique options.

  Shared puzzle config and defaults:
    rows: 3,            // Number of rows to chop image into
    columns: 3,         // Number of columns to chop image into
    images: [],         // Primary puzzle image(s).  Currently, all puzzles only use one image.
    backgrounds: [],    // Background (table) image(s).  Currently, only one image is used.
    shuffles: <based on # of pieces>, // The number of piece shuffles to perform
    shuffle_speed: 150,               // 0 for instant shuffle (no visible shuffling)
    move_speed: 150,                  // User move speed of piece, 0 for instant move
    image_path: <OverPuzzle assets path>, // Image asset path
    audio_path: <OverPuzzle audio path>,  // Audio asset path
    sounds: {

    },
    table_width: <OverPuzzle width>,    // Width of the background ("table")
    table_height: <OverPuzzle height>,  // Height of the background ("table")
    board_width: 500,   // Width of the actual puzzle
    board_height: 500,  // Width of the actual puzzle

    shuffled_ids: null, // Set to an array desginating that the image has been pre-shuffled and to just cut and assign ids.
                        // See advanced discussion below.
    // Callbacks
    on_check: function() {  }.bind(this),
    on_win: function() { console.log('won!') }.bind(this),
    on_move: function(p) {  }.bind(this),
    on_ready: function() { }.bind(this),

    // Audio functions to override.
    on_move_audio: function(p) { this.play_sound_unqiue('move',{ detune: 300 }) }.bind(this),
    on_no_move_audio: function(p) { this.play_sound_unqiue('no_move',{ detune: 300 }) }.bind(this),
    on_win_audio: function(p) { this.play_sound('win') }.bind(this),
    on_start_audio: function(p) { this.play_sound('start') }.bind(this),

  Slide Puzzle config and defaults:
    open_piece: [x,y] // Sets the x and y coords of the piece that is open or empty.  Default is the bottom,right corner.

  Rotate Puzzle config and defaults:
    inc_angle: <degrees> // Default = 90.  The degrees each click spins the piece.

  Code Puzzle config and defaults:
    answer_length: <#>  // Default = 3, the code length
    answers: [],        // TBD
    multiples: <X>      // The number of times a piece can be in the code.  Default = 1.  Think "9119"
