var SpaceHipster = SpaceHipster || {};

SpaceHipster.Enemy = function(game, x, y, key, health, enemyBullets) {
    
    Phaser.Sprite.call(this, game, x, y, key);
    
    this.game = game;
    
    //zezwolenie na fizyke
    //this.game.physics.arcade.enable(this);
    
    
    this.animations.add('getHit', [0,1,2,1,0], 25, false);
    this.anchor.setTo(0.5);
    
    this.health = health;
    
    this.alive = true;
    
    
    this.enemyBullets = enemyBullets;
    //this.checkWorldBounds = true;
    //this.outOfBoundsKill = true;
    
    this.enemyTimer = this.game.time.create(false);
    
    this.enemyTimer.start();
    this.scheduleShooting();
    
};

SpaceHipster.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
SpaceHipster.Enemy.prototype.constructor = SpaceHipster.Enemy;
//dodajemy prototyp funkcji update aby zmiejszyć ilość kodu w update
SpaceHipster.Enemy.prototype.update = function(){
    if(this.x < 0.05 * this.game.world.width){
        this.x = 0.05 * this.game.world.width + 2;
        this.body.velocity.x *= -1;
    }
    else if (this.x > 0.95 * this.game.world.width){
        this.x = 0.95 * this.game.world.width -2;
        this.body.velocity.x *= -1;
    }
    
    if(this.position.y >this.game.world.height){
        
        this.kill();
    
    }
    
    
};

SpaceHipster.Enemy.prototype.reset = function(x, y, health, key, scale, speedX, speedY){
    Phaser.Sprite.prototype.reset.call(this, x, y, health);
    
    this.loadTexture(key);
    this.scale.setTo(scale);
    this.body.velocity.x = speedX;
    this.body.velocity.y = speedY;
    this.enemyTimer.resume();
};


SpaceHipster.Enemy.prototype.scheduleShooting = function(){
    
    this.shoot();
    
    this.enemyTimer.add(Phaser.Timer.SECOND * 2, this.scheduleShooting, this);
};
SpaceHipster.Enemy.prototype.shoot = function(){
    var bullet = this.enemyBullets.getFirstExists(false)
   
    if(!bullet){
        bullet = new SpaceHipster.EnemyBullet(this.game, this.x, this.bottom);
        this.enemyBullets.add(bullet);
    }
    else{
        bullet.reset(this.x, this.y)
    }
    var velocityBullet = 100;
    
    bullet.body.velocity.y = velocityBullet;
};
