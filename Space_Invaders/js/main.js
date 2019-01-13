var SpaceHipster = SpaceHipster || {};

//można używać procentowej powieszchni ekranu jak ozmiennej albo liczby która ustalimy
SpaceHipster.game = new Phaser.Game('100%', '100%', Phaser.AUTO);

SpaceHipster.game.state.add('GameState', SpaceHipster.GameState);
SpaceHipster.game.state.start('GameState');