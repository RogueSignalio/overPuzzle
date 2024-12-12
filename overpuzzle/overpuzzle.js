class OverPuzzle {
  constructor (config={},puzzle=null,engine=null) {
    this.plugins = {
      slidepuzzle: 'imagepuzzle',
      codepuzzle: 'imagepuzzle',
      rotatepuzzle: 'imagepuzzle',
      imagepuzzle: null
    }

    this.config = {
      debug: false,
      audio_on: true,
      preload: false,
      volume: 0.5,
      image_path: './overpuzzle/assets/',
      audio_path: './overpuzzle/audio',
      modules_path: './overpuzzle/modules',
      width: window.innerWidth,
      height: window.innerHeight,
      audio_engine: null,
      ...config
    }

    this.loaded = {}
    this.scenes = {}
    this.counter = 0
    this.muted = false
    this.engine = engine
    if (this.engine == null) {
      this.engine = this.new_engine()
    }      
    if (this.config.audio_engine == null) {
      this.load_script('puzzleaudio',()=> {
        this.audio_engine = new Puzzleaudio()
        this.engine.scene.add('audio_engine', this.audio_engine, true, {} );
      })
    }

    if (puzzle != null) {
      add_puzzle(puzzle,this) 
    }
  }

  stop() {
    this.stop_current_puzzle()
  }

  stop_current_puzzle() {
    if (this.current_scene == null) { return }
    if (this.current_scene.scene.isActive) { 
      this.current_scene.stop_sounds(this.current_scene.key)
      this.current_scene.scene.stop()
      this.current_scene.scene.destroy()
      delete this.scenes[this.current_scene.key]
    }
    this.current_scene = null
  }

  stop_puzzle(key) {
    if (this.scenes[key].isActive) { 
      this.current_scene.stop_sounds(this.current_scene.key)
      this.scenes[key].scene.stop()
      this.scenes[key].scene.destroy()
      delete this.scenes[this.current_scene.key]
    }
  }

  audio_toggle() {
    this.audio_engine.mute_toggle()
  }

  new_engine() {
    let conf = {
      type: Phaser.AUTO,
      width: this.config.width || window.innerWidth,
      height: this.config.height || window.innerHeight,
      transparent: false || this.config.transparent, 
      backgroundColor: this.config.background || 'rgba(0,0,0,0)',
      parent: this.config.parent || "overpuzzle",
      canvasStyle: "z-index:-10000;visibility:hidden;",
    }
    return new Phaser.Game(conf);
  }

  // Raise or lower to the z-index min or max layer
  to_front(zindex=this.config.z_index) { this.engine.canvas.style.zIndex = zindex; this.engine.canvas.focus(); this.engine.canvas.style.visibility = 'visible'; }
  to_back(zindex=(this.config.z_index*-1)) { this.engine.canvas.style.zIndex = zindex; this.engine.canvas.style.visibility = 'hidden'; this.engine.canvas.blur(); }

  load_script(name,onload=null) {
    if (this.config.preload) { this.loaded[name] = true; }
    else {
      if (this.plugins[name] != null) {
        this.insert_script(this.plugins[name], ()=>{
          this.insert_script(name,onload)
        })
      }
      else { this.insert_script(name,onload) }
    }
  }

  insert_script(name,onload=()=>{ }) {
    if (this.loaded[name]) {
      onload.call(this)
    } else {
      let script = document.createElement('script');
      script.id = `${name}.js`;
      script.src = `${this.config.modules_path}/${name}.js`;
  //    script.type = 'module';
      document.body.append(script);
      script.onload = ()=> { 
        this.loaded[name] = true; 
        onload.call(this);  
        this.config.debug && console.log(`${name} loaded.`); 
      }
    }
  }

  // Add a new puzzle.
  // TODO: disable auto run_scene by default.
  add_puzzle(key,puzzle={}) {
    op.stop_current_puzzle()
    var type = puzzle.type
    if (!this.loaded[type]) { this.load_script(type,()=>{ this.init_puzzle(key,type,puzzle); }) }
    else {
      this.init_puzzle(key,type,puzzle);
    }
  }

  init_puzzle(key,name,config={}) {
    var config = {
      key: `${key}_${this.counter}`,
      engine: this.engine,
      ...this.config,
      ...config
    }
    var cname = name[0].toUpperCase() + name.substr(1)
    this.config.debug && console.log("Run " + config.key, config)
    var myscene = eval(`new ${cname}(config , this)`)
    myscene.audio_engine = this.audio_engine
    this.scenes[config.key] = myscene
    this.current_scene = myscene
    this.engine.scene.add(config.key, myscene, true, {} );
    this.to_front(90)
//     if (this.counter == 0) {
// //      this.to_front()
// //        this._check_timer()
//     }
    this.counter++;
  }

  _check_timer() {
    setOverTimeout(() => {
      let ret = this.active_check();
      this.config.debug && console.log('Timer: '+ ret + ':' + this.engine.scene.scenes.length);
      if (ret == true) this._check_timer()
    },300);
  }

}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
