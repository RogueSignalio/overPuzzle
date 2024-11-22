class OverPuzzle {
  constructor (config={},puzzle=null,engine=null) {
    this.config = {
      debug: false,
      audio_on: true,
      preload: false,
      volume: 0.5,
      image_path: './overpuzzle/assets/',
      audio_path: './overpuzzle/audio',
      modules_path: './overpuzzle/modules',
      width: 800 ,
      height: 620,
      ...config
    }
    this.loaded = []
    this.scenes = []

    this.engine = engine
    if (this.engine == null) {
      this.engine = this.new_engine()
    }      

    if (puzzle != null) {
      add_puzzle(puzzle,this) 
    }
  }

  // Add a new puzzle.
  // TODO: disable auto run_scene by default.
  add_puzzle(puzzle={}) {
    var name = puzzle.name
    if (!this.loaded[name]) { this.load_module(name,()=>{ this._run_scene(name,puzzle); }) }
  }

  stop_puzzle(name) {
    this.scenes[name].stop
  }

  new_engine() {
    let conf = {
      type: Phaser.AUTO,
      width: this.config.width || window.innerWidth,
      height: this.config.height || window.innerHeight,
      transparent: false || this.config.transparent, 
      backgroundColor: this.config.background || 'rgba(0,0,0,0)',
      parent: this.config.parent || "overpuzzle",
      canvasStyle: "position:absolute;top:0px;left:0px;z-index:-10000;visibility:hidden;",
    }
console.log('',conf)
    return new Phaser.Game(conf);
  }
  // Raise or lower to the z-index min or max layer
  to_front(zindex=this.config.z_index) { this.engine.canvas.style.zIndex = zindex; this.engine.canvas.focus(); this.engine.canvas.style.visibility = 'visible'; }
  to_back(zindex=(this.config.z_index*-1)) { this.engine.canvas.style.zIndex = zindex; this.engine.canvas.style.visibility = 'hidden'; this.engine.canvas.blur(); }

  load_module(name,onload=null) {
    if (this.config.preload) this.loaded[name] = true;
    if (this.loaded[name]) return;
    const script = document.createElement('script');
    script.id = `${name}.js`;
    script.src = `${this.modules_path}/${name}.js`;
    document.body.append(script);
    if (!onload) onload = ()=>{ };
    script.onload = ()=> { this.loaded[name] = true; onload.call(this); }
    this.config.debug && console.log(`${name} loaded.`)
  }

  _run_scene(name,config={}) {
    var config = {
      key: `${name}/${this.counter}`,
      engine: this.engine,
      ...this.config,
      ...config
    }
    var cname = name[0].toUpperCase() + name.substr(1)
    this.config.debug && console.log("Run " + config.key, config)
    var myscene = eval(`new ${cname}(config)`)
    this.engine.scene.add(config.key, myscene, true, {} );
    if (this.counter == 0) {
      this.to_front()
//        this._check_timer()
    }
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
