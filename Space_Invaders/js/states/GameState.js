var SpaceHipster = SpaceHipster || {};

SpaceHipster.GameState = {
    
    //załączenie pierwszych plików
    init: function(currentLevel) {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        this.PLAYER_SPEED = 200;
        this.BULLET_SPEED = -1000;
        
        //level data
        this.numLevels = 3;
        this.currentLevel = currentLevel ? currentLevel : 1;
        
    },
    //wczytanie wszystkich rzeczy przed grą
    preload: function(){
        this.load.image('space', 'assets/images/space.png');
        this.load.image('player', 'assets/images/player.png');
        this.load.image('bullet', 'assets/images/bullet.png');
        this.load.image('enemyParticle', 'assets/images/enemyParticle.png');
        
        this.load.spritesheet('yellowEnemy', 'assets/images/yellow_enemy.png', 50, 46, 3, 1, 1);
        this.load.spritesheet('redEnemy', 'assets/images/red_enemy.png', 50, 46, 3, 1, 1);
        this.load.spritesheet('greenEnemy', 'assets/images/green_enemy.png', 50, 46, 3, 1, 1);
        
        //wczytywanie plików JSON
        this.load.text('level1', 'assets/data/level1.json');
        this.load.text('level2', 'assets/data/level2.json');
        this.load.text('level3', 'assets/data/level3.json');
        
        //wczytanie muzyki
        this.load.audio('orchestra', 'assets/audio/8bit-orchestra.mp3', 'assets/audio/8bit-orchestra.ogg')
    },
    
    create: function(){
        //tileSprite jest to samopowraezakna opcja obrazka
        this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
        //metoda aby nadać tłu mobilność 
        this.background.autoScroll (0, 30);
        
        //gracz
        this.player = this.add.sprite(this.game.world.centerX, this.game.world.height-50, 'player');
        this.player.anchor.setTo(0.5);
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds = true;
        
        //inicjalizacja funkcji tworzącej pociski
        this.initBullets();
        this.shootingTimer = this.game.time.events.loop(Phaser.Timer.SECOND/5, this.createPlayerBullet, this);
        
        //fixed enemy
        this.initEnemies();
        //wczytywanie poziomu
        this.loadLevel();
        
        //dodanie dzwięku
        this.orchestra = this.add.audio('orchestra');
        this.orchestra.play();
    },
    
    
    update: function(){
        //włączenie zsprawdzania czy objekty się przeniknęły, nazwa 2 objektów które wchodzą w interakcję, co stanie się jak wejdą w interakcjię
        //warunek w którym interakcja ma miejsce, coś co chcemy przesłać do funkcji
        this.game.physics.arcade.overlap(this.playerBullets, this.enemies, this.damageEnemy, null, this);
        this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.killPlayer, null, this);
        
        //player uin not moving
        this.player.body.velocity.x = 0;
        //nasłuchiwanie na input gracza
        if(this.game.input.activePointer.isDown){
            //gdzie dotknął gracz
            var targetX = this.game.input.activePointer.position.x;
            //definicja ruchu gracza zależna od kliknięcia na planszy
            var direction = targetX >= this.game.world.centerX ? 1 : -1;
            
            this.player.body.velocity.x = direction * this.PLAYER_SPEED;
        }
    },
    
    //metoda do przechowywania podcisków
    initBullets: function(){
        this.playerBullets = this.add.group();
        this.playerBullets.enableBody = true;
    },
    
    //tworzenie pocisków
    createPlayerBullet: function(){
        var bullet = this.playerBullets.getFirstExists(false);
        
        if(!bullet){
            bullet = new SpaceHipster.PlayerBullet(this.game, this.player.x, this.player.top);
            this.playerBullets.add(bullet);
        }
        else{
            //reset position
            bullet.reset(this.player.x, this.player.top);
        }
        
        //set velocity
        bullet.body.velocity.y = this.BULLET_SPEED;
    },
    
    initEnemies: function(){
        this.enemies = this.add.group();
        //zezwolenie na fizykę w grupię ;3
        this.enemies.enableBody = true;
        
        this.enemyBullets = this.add.group()
        this.enemyBullets.enableBody = true;
        
        
    },
    damageEnemy: function(bullet, enemy){
        //enemy.damage(2);
        enemy.health -= 1;
        
        bullet.kill();
        enemy.play('getHit');
        if (enemy.health <= 0)
            {
                //rozpad na kawałeczki
                var emitter = this.game.add.emitter(enemy.x, enemy.y, 100);
                emitter.makeParticles('enemyParticle');
                emitter.minParticleSpeed.setTo(-200, -200);
                emitter.maxParticleSpeed.setTo(200, 200);
                emitter.gravity = 0;
                enemy.kill();
                //czy chcemy eksplozje, na jak długo one mają zostać, częstotliwość gdy nie explozja, ile, 
                emitter.start(true, 500, null, 100);
                enemy.enemyTimer.pause();
            }
    },
    killPlayer: function(){
        this.player.kill();
        this.orchestra.stop();
        this.game.state.start('GameState');
    },
    
    createEnemy: function(x, y, health, key, scale, speedX, speedY){
        var enemy = this.enemies.getFirstExists(false);
        
        if(!enemy){
            enemy = new SpaceHipster.Enemy(this.game, x, y, key, health, this.enemyBullets)
            this.enemies.add(enemy);
        }
            enemy.reset(x, y, health, key, scale, speedX, speedY);
        
    },
    
    loadLevel: function(){
        
        this.currentEnemyIndex = 0;
        
        
        this.levelData = JSON.parse(this.game.cache.getText('level' + this.currentLevel));
        
        //end of the level timer
        this.endOfLevelTimer = this.game.time.events.add(this.levelData.duration * 1000, function(){
            
            this.orchestra.stop();
            if(this.currentLevel < this.numLevels){
                this.currentLevel++;
                
            }
            else{
                this.currentLevel = 1;
            }
            
            this.game.state.start('GameState', true, false, this.currentLevel);
        }, this)
        
        this.scheduleNextEnemy();
    },
    scheduleNextEnemy: function(){
        var nextEnemy = this.levelData.enemies[this.currentEnemyIndex];
        if(nextEnemy){
            //ustawienie wartoci zależne od warunku
            var nextTime = 1000 * (nextEnemy.time - (this.currentEnemyIndex == 0 ? 0 : this.levelData.enemies[this.currentEnemyIndex - 1].time));
            
            this.nextEnemyTimer = this.game.time.events.add(nextTime, function(){
                
                this.createEnemy(nextEnemy.x * this.game.world.width, -100, nextEnemy.health, nextEnemy.key, nextEnemy.scale, nextEnemy.speedX, nextEnemy.speedY )
                this.currentEnemyIndex++;
                this.scheduleNextEnemy();
            }, this);
        }
    }
};