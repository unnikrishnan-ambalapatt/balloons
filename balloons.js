// Define the constants
const SCREEN_WIDTH = 1024;
const SCREEN_HEIGHT = 720;
const GRAVITY_Y = -100;
const INIT_BALLOON_COUNT = 50;
const SCORE_TO_INIT_BALLS = 50;
const POINTS_PER_HIT = 5;
const MAX_BALL_HIT_COUNT = 1;
const SCORE_X = 900;
const SCORE_Y = 20;
const SCORE_COLOR = '#FCC';
const SCORE_FONT_SIZE = '22px';
const SCORE_FONT = 'Consolas';
const GAME_OVER_COLOR = '#F00'
const GAME_OVER_FONT_SIZE = '72px';
const GAME_OVER_FONT = 'Impact';

let gameScene = new Phaser.Scene('Game');
let gameOverScene = new Phaser.Scene('GameOver');

let config = {
    type: Phaser.AUTO,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: GRAVITY_Y
            },
            debug: false
        }
    },
    scene: [gameScene, gameOverScene]
};

let game = new Phaser.Game(config);

let balloons;
let balls;
let score = 0;
let scoreText;
let ballHitCount = 0;
let gameOver = false;

gameScene.preload = function() {

    // Pre-load all the assets
    this.load.image('park', 'assets/park.png');
    this.load.image('balloon', 'assets/balloon.png');
    this.load.image('ball', 'assets/ball.png');
};

gameScene.create = function() {

    // Add the park background for the main game screen
    this.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'park');

    // Add balloons and handle behaviour
    gameScene.manageBalloons(INIT_BALLOON_COUNT);

    // Add group for balls, clicking on a ball would reduce the score
    balls = this.physics.add.group();

    // Set score board
    scoreText = this.add.text(SCORE_X, SCORE_Y, 'Hits: 0', {
        fontSize: SCORE_FONT_SIZE,
        fontFamily: SCORE_FONT,
        fill: SCORE_COLOR
    });
};

gameScene.update = function() {

    // If game over, stop current scene and start GameOver scene and return
    if (gameOver) {
        this.physics.pause();
        game.scene.stop('Game');
        game.scene.start('GameOver');
        return;
    }
    // Add one new balloon for each update cycle
    gameScene.manageBalloons(0);

    // If score exceeds SCORE_TO_INIT_BALLS, introduce the enemy - the balls
    if (score > SCORE_TO_INIT_BALLS) {
        gameScene.createBalls();
    }
};

/* Function to add balloons
    @extraBalloonCount - Extra number of balloons
*/
gameScene.manageBalloons = function(extraBalloonCount) {

    // Add balloons 'extraBalloonCount' times
    balloons = this.physics.add.group({
        key: 'balloon',
        repeat: extraBalloonCount,
        gravity: {
            y: -100
        },
        setXY: {
            x: Phaser.Math.Between(0, 800),
            y: 800,
            stepX: 10
        }
    });

    // Set properties for each balloon
    balloons.children.iterate(function(balloon) {
        balloon.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        balloon.setVelocityX(Phaser.Math.Between(-100, 100));
        balloon.setVelocityY(Phaser.Math.Between(-100, 100));
        balloon.setScale(Phaser.Math.Between(20, 30) / 100);

        // If clicked on a balloon, call burstBalloon()
        balloon.setInteractive().on('pointerdown', function(pointer, localX, localY, event) {
            gameScene.burstBalloon(balloon);
        });
    });
};

// Function to add balls
gameScene.createBalls = function() {
    var x = Phaser.Math.Between(0, 400);
    var y = 0;

    var ball = balls.create(x, y, 'ball');
    ball.setBounce(2);
    //ball.setCollideWorldBounds(true);
    ball.setVelocity(Phaser.Math.Between(-200, 400), Phaser.Math.Between(-200, 400));
    ball.allowGravity = true;
    ball.gravity = {
        y: 1000
    };

    // If clicked on a ball, call hitBall()
    ball.setInteractive().on('pointerdown', function(pointer, localX, localY, event) {
        gameScene.hitBall(ball);
    });
};

// Event handler for balloon click / touch
gameScene.burstBalloon = function(balloon) {

    // Disable and hide the clicked / touched balloon
    balloon.disableBody(true, true);

    //  Add and update the score
    score += POINTS_PER_HIT;
    scoreText.setText('Hits: ' + score);
};

// Event handler for ball click / touch
gameScene.hitBall = function() {
    ballHitCount++;
    if (ballHitCount > MAX_BALL_HIT_COUNT) {
        gameOver = true;
    }
};

// Load new scene for game over
gameOverScene.preload = function() {
    this.load.image('sky', 'assets/sky.png');
};

gameOverScene.create = function() {
    this.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'sky');
    let gameOverText = this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - (SCREEN_HEIGHT / 10), 'Game Over!', {
        fontSize: '72px',
        fontFamily: 'Impact',
        fill: '#F00'
    }).setOrigin(0.5);
    let gameOverScoreText = this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + (SCREEN_HEIGHT / 10), 'You scored: ' + score, {
        fontSize: GAME_OVER_FONT_SIZE,
        fontFamily: GAME_OVER_FONT,
        fill: GAME_OVER_COLOR
    }).setOrigin(0.5);
};
