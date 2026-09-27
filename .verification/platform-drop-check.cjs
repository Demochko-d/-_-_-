const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
global.window = global;
const handlers = {};
global.addEventListener = (type, handler) => { handlers[type] = handler; };
for (const file of ['js/app.js','js/config/gameConfig.js','js/utils/MathUtils.js',
  'js/core/InputManager.js','js/entities/Entity.js','js/animation/AnimationStateMachine.js',
  'js/animation/characters/PlayerAnimations.js','js/entities/Player.js','js/systems/CollisionSystem.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{filename:file});
}
for (const code of ['ArrowDown','KeyS']) {
  const input = new GameApp.core.InputManager();
  const collision = new GameApp.systems.CollisionSystem(500,500,[{x:50,y:200,width:300},{x:50,y:350,width:300}]);
  const player = new GameApp.entities.Player({x:100,y:200-42});
  handlers.keydown({code,preventDefault(){}});
  player.update(1/60,input,collision);
  assert.ok(player.position.y+player.height>200,'Pressed key drops player through upper platform');
  assert.equal(player.grounded,false);
  for(let i=0;i<120;i++)player.update(1/60,input,collision);
  assert.equal(player.position.y+player.height,350,'Lower platform catches player, holding key does not drop twice');
  handlers.keyup({code}); handlers.keydown({code,preventDefault(){}});
  for(let i=0;i<120;i++)player.update(1/60,input,collision);
  assert.equal(player.position.y+player.height,500,'Second press drops to solid ground');
  handlers.keyup({code}); handlers.keydown({code,preventDefault(){}});
  player.update(1/60,input,collision);
  assert.equal(player.position.y+player.height,500,'Ground stays solid');
  player.position.y=200-player.height; player.velocity.y=0;
  player.update(1/60,input,collision);
  assert.equal(player.position.y+player.height,200,'Dropped platform becomes solid again');
}
console.log('Platform drop passed: ArrowDown and S, lower-platform landing, one drop per press, solid ground and restored collisions.');
