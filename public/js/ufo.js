define(
  [
    'require',
    'physicsjs',
    'physicsjs/bodies/circle'
  ],

  function(require, Physics) {
    return Physics.body('ufo', 'circle', function(parent) {
      var ast1 = new Image();
      ast1.src = require.toUrl('images/ufo.png');

      return {
        init: function(options) {
          parent.init.call(this, options);

          this.view = ast1;
        },

        blowUp: function() {
          var world = this._world;
          if (!world) {
            return this;
          }

          var scratch = Physics.scratchpad()
            , rnd = scratch.vector()
            , pos = this.state.pos
            , n = 40
            , r = 2 * this.geometry.radius
            , size = r/n
            , mass = 0.001
            , d
            , debris = [];

          while (n--) {
            rnd.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).mult(r);
            d = Physics.body('circle', {
              x: pos.get(0) + rnd.get(0),
              y: pos.get(1) + rnd.get(1),
              vx: this.state.vel.get(0) + (Math.random() - 0.5),
              vy: this.state.vel.get(1) + (Math.random() - 0.5),
              angularVelocity: (Math.random() - 0.5) * 0.06,
              mass: mass,
              radius: size,
              restitution: 0.8
            });
            d.gameType = 'debris';

            debris.push(d);
          }

          setTimeout(function() {
            for (var i = 0, l = debris.length; i < l; ++i) {
              world.removeBody(debris[i]);
            }
            debris = undefined;
          }, 1000);

          world.add(debris);
          world.removeBody(this);
          scratch.done();
          world.publish({
            topic: 'blow-up',
            body: this
          });
          return this;
        }
      }
    });
  }
);