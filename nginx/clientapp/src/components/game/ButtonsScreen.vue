<template>
  <div
    class="bg-image container"
    :id="'bg-image_'+background_id"
  >
    <div class="container">

      <div class="header-container">
        <span class="header">{{ game_data.header }}</span>
      </div>

      <div class="button-container">
        <div
          v-for="button in game_data.buttons"
          :key="button.id"
        >
          <div class="item">
            <button
              class="big-btn"
              @click="send(button)"
              :disabled="disableButtons"
              :class="[{ 'big-btn-pressed': button == buttonPressed }, 
						{'correct': button == correctAnswer &&  correctAnswer != null},
						{'incorrect': button != correctAnswer && button == buttonPressed  && correctAnswer != null},
						{'single-btn': game_data.buttons.length == 1}
						]"
            >
              {{ button }}

            </button>
          </div>
        </div>
      </div>

      <div class="footer-container">
        <span class="footer">{{ game_data.footer }}</span>
      </div>

    </div>
  </div>
</template>

<script>
import { GameBus } from "../../busses/GameBus";

export default {
  name: "buttonScreen",
  props: {
    game_data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      background_id: 1,
      disableButtons: false,
      buttonPressed: null,
      correctAnswer: null
    };
  },
  mounted() {
    this.background_id = Math.floor(Math.random() * 3) + 1;
    GameBus.$on("action", action => {
      this.action(action);
    });
    GameBus.$on("answer", answer => {
      this.answer(answer);
    });
  },
  methods: {
    send(button) {
      if (this.correctAnswer == null && this.buttonPressed == null) {
        this.disableButtons = true;
        this.buttonPressed = button;
        let data = {
          user: this.$store.getters.user.nickname,
          id: this.$store.getters.user.id,
          answer: button
        };
        this.$store.dispatch("sendMessage", { data });
      }
    },
    action(action) {
      if (action && this.buttonPressed != null) {
        if (action == "again") {
          this.game_data.action = "";
          setTimeout(() => {
            this.disableButtons = false;
            this.buttonPressed = null;
          }, 200);
        }
      }
    },
    answer(answer) {
      this.correctAnswer = answer;
    }
  }
};
</script>

<style lang="scss" scoped>
#bg-image_1 {
  background-image: url("./../../assets/backgrounds/game_bg_1.png");
  height: 100%;
}
#bg-image_2 {
  background-image: url("./../../assets/backgrounds/game_bg_2.png");
  height: 100%;
}
#bg-image_3 {
  background-image: url("./../../assets/backgrounds/game_bg_3.png");
  height: 100%;
}

.item {
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  margin: 0 auto;
}

.header-container {
  height: 25%;
  font-family: TTTunnels-Black;
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  justify-content: center;
	text-transform: uppercase;
	
}
.header {
  margin: auto;
  font-size: 40px;
	padding: 20px;
	overflow-wrap: break-word;
	word-wrap: break-word;
	max-width: 90vw;
}

.button-container > div {
  min-width: 50vw;
}

.big-btn {
  background-color: $yellow;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
  color: $dark;
  margin-left: 5px;
  margin-bottom: 5px;
  width: 40vw;
  height: 40vw;
  text-decoration: none;
  border: none;
  text-transform: uppercase;
  -webkit-transition: all 0.2s ease;
  -o-transition: all 0.2s ease;
  transition: all 0.2s ease;
  font-family: TTTunnels-Black;
  font-weight: bolder;
  font-size: 40px;
  -webkit-box-shadow: -5px 5px 0px 2px rgba(0, 0, 0, 1);
  -moz-box-shadow: -5px 5px 0px 2px rgba(0, 0, 0, 1);
  box-shadow: -5px 5px 0px 2px rgba(0, 0, 0, 1);
  -webkit-transition: background-color 100ms linear;
  -ms-transition: background-color 100ms linear;
  transition: background-color 100ms linear;
  &.single-btn {
    width: 80vw !important;
    height: 80vw !important;
  }
}

.big-btn-pressed {
	color: white;
  background-color: $dark;
  text-transform: uppercase;
  -webkit-transition: all 0.2s ease;
  -o-transition: all 0.2s ease;
  transition: all 0.2s ease;
  margin-left: -5px;
  margin-bottom: -5px;
  -webkit-box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 1);
  -moz-box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 1);
  box-shadow: 1px 0px 0px 0px rgba(0, 0, 0, 1);
  -webkit-transition: background-color 100ms linear;
  -ms-transition: background-color 100ms linear;
	transition: background-color 100ms linear;
	-webkit-transition: color 100ms linear;
  -ms-transition: color 100ms linear;
  transition: color 100ms linear;
}
.correct {
	background-color: rgb(0, 241, 88);
	color: $dark!important;
	-webkit-transition: color 100ms linear;
  -ms-transition: color 100ms linear;
  transition: color 100ms linear;
}
.incorrect {
	background-color: rgb(255, 0, 0);
	color: $dark!important;
	-webkit-transition: color 100ms linear;
  -ms-transition: color 100ms linear;
  transition: color 100ms linear;
}
</style>
