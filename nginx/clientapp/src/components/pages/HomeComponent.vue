<template>
  <div
    class="bg-image container"
    id="bg-image"
  >
    <div class="container">
      <div class="row">
        <div class="logo-outer">
          <img
            class="bigLogo center"
            src="../../assets/logo.png"
            alt=""
          >
        </div>
      </div>
      <div class="row">
        <div class="game-outer">
          <transition name="fade">
            <span
              class="game-status"
              data-shadow='dang!'
              v-if="!game_found"
            >
              Geen spel gaande...
            </span>
            <div
              class="game-button"
              v-if="game_found && can_join"
            >
              <button
                class="start-btn"
                @click="startGame"
                :class="button_class"
              >Speel mee</button>
            </div>
            <span
              class="game-status"
              v-if="game_found && !can_join"
            >
              Kan niet meespelen
            </span>
          </transition>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { UserApi } from "../../api";

export default {
  data() {
    return {
      button_class: "",
      interval: undefined,
      game: {},
      game_found: false,
      can_join: true
    };
  },
  methods: {
    getStatus() {
      UserApi.game_status()
        .then(data => {
          if (data != false || data == undefined) {
            this.game = data;
            this.game_found = true;
            if (this.game.cannot_join) {
              this.can_join = false;
            } else {
							this.can_join = true;
              if (this.$store.getters.inGame == true) {
                this.$router.push({
                  name: "game",
                  params: { game: this.game }
                });
              }
            }
          } else {
            setTimeout(() => {
              this.game = {};
              this.game_found = false;
            }, 1000);
          }
        })
        .catch(() => {
          setTimeout(() => {
            this.game = {};
            this.game_found = false;
          }, 1000);
        });
    },
    startGame() {
			this.getStatus();
			if(this.can_join){
				this.button_class = "btn-pressed";
				setTimeout(() => {
					this.button_class = "";
					this.$router.push({ name: "game", params: { game: this.game } });
				}, 1000);
			}
    }
  },
  mounted: function() {
    this.getStatus();
    this.interval = setInterval(() => {
      this.getStatus();
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.interval);
  }
};
</script>

<style lang="scss" scoped>
#bg-image {
  background-image: url("./../../assets/backgrounds/home_bg.png");
  height: 100%;
}
.bigLogo {
  max-width: 50%;
}
.game-outer {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.game-status {
  margin: 0 auto;
  text-align: center;
  font-size: 60px;
  width: 80%;
  display: block;
  font-family: TTTunnels-Black;
  line-height: 60px;
  text-transform: uppercase;
  position: absolute;
}

.game-status {
  color: #fff;
  font-weight: bold;
  // font-family: Helvetica;
  text-align: center;
  text-shadow: 
    0 1px 0 #ccc, 
    0 2px 0 #c9c9c9, 
    0 3px 0 #bbb, 
    0 4px 0 #b9b9b9, 
    0 5px 0 #aaa, 
    0 6px 1px rgba(0, 0, 0, 0.233), 
    0 0 5px rgba(0,0,0,.1), 
    0 1px 3px rgba(0, 0, 0, 0.438), 
    0 3px 5px rgba(0,0,0,.2), 
    0 5px 10px rgba(0,0,0,.25), 
    0 10px 10px rgba(0, 0, 0, 0.397), 
    0 20px 20px rgba(0, 0, 0, 0.486);
}

// .game-status {
//   display: inline-block;
//   color: white;
//   text-shadow: .03em .03em 0 hsla(230,40%,50%,1);
//   }
//   .game-status:after {
//     content: attr(data-shadow);
//     position: absolute;
//     top: .06em; left: .06em;
//     z-index: -1;
//     text-shadow: none;
//     background-image:
//       linear-gradient(
//         45deg,
//         transparent 45%,
//         hsla(48,20%,90%,1) 45%,
//         hsla(48,20%,90%,1) 55%,
//         transparent 0
//         );
//     background-size: .05em .05em;
//     -webkit-background-clip: text;
//     -webkit-text-fill-color: transparent;
  
//     animation: shad-anim 15s linear infinite;
//     }

// @keyframes shad-anim {
//   0% {background-position: 0 0}
//   0% {background-position: 100% -100%}
// }
  
.game-button {
  margin-right: 10px;
  position: absolute;
}
.start-btn {
  background-color: $yellow;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
  color: $dark;
  margin-left: 5px;
  margin-bottom: 5px;
  width: 200px;
  height: 200px;
  text-decoration: none;
  border: none;
  text-transform: uppercase;
  -webkit-transition: all 0.2s ease;
  -o-transition: all 0.2s ease;
  transition: all 0.2s ease;
  font-family: TTTunnels-Black;
  font-weight: bolder;
  font-size: 60px;
  -webkit-box-shadow: -5px 5px 0px 2px rgba(0, 0, 0, 1);
  -moz-box-shadow: -5px 5px 0px 2px rgba(0, 0, 0, 1);
  box-shadow: -5px 5px 0px 2px rgba(0, 0, 0, 1);
}

.start-btn:hover {
  text-transform: uppercase;
  -webkit-transition: all 0.2s ease;
  -o-transition: all 0.2s ease;
  transition: all 0.2s ease;
  margin-left: 4px;
  margin-bottom: 4px;
  -webkit-box-shadow: -4px 4px 0px 2px rgba(0, 0, 0, 1);
  -moz-box-shadow: -4px 4px 0px 2px rgba(0, 0, 0, 1);
  box-shadow: -4px 4px 0px 2px rgba(0, 0, 0, 1);
}
.start-btn:active {
  text-transform: uppercase;
  -webkit-transition: all 0.2s ease;
  -o-transition: all 0.2s ease;
  transition: all 0.2s ease;
  margin-left: -5px;
  margin-bottom: -5px;
  -webkit-box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 1);
  -moz-box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 1);
  box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 1);
}
.btn-pressed {
  text-transform: uppercase;
  -webkit-transition: all 0.2s ease;
  -o-transition: all 0.2s ease;
  transition: all 0.2s ease;
  margin-left: -5px;
  margin-bottom: -5px;
  -webkit-box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 1);
  -moz-box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 1);
  box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 1);
}
.row {
  height: 50vh;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
