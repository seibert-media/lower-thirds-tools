<template>
  <div class="lower-third-seibert-middle open">
		<div class="main">
			<div class="title-box first">
				<div class="title-box second">
					<div class="title-box third">
						<div class="text-spacer">{{ title }}</div>
					</div>
				</div>
			</div>
			<div class="text-clip">
				<div class="text">{{ title }}</div>
			</div>
		</div>

		<div class="sub" v-show="subtitle">
			<div class="title-box">
				<div class="text-spacer">{{ subtitle }}</div>
			</div>
			<div class="text-clip">
				<div class="text">{{ subtitle }}</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";

export default defineComponent({
  name: "SeibertMiddle",
  props: {
    'title': {
      type: String,
      required: true,
    },
    'subtitle': {
      type: String,
      required: false,
    }
  },
});
</script>

<style>
  .lower-third-seibert-middle {
    position: absolute;
    width: 100%;
    bottom: 85px;
    font-family: "ConduitOSITC TT", Lato, sans-serif;
  }
  .lower-third-seibert-middle .text-spacer {
    visibility: hidden;
  }
  .lower-third-seibert-middle .text-clip {
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    text-align: center;
  }
  .lower-third-seibert-middle .text {
    padding: 0 10px;
    position: relative;
  }
  .lower-third-seibert-middle .title-box {
    display: flex;
    margin: 0 auto;
    transform: scaleX(0);
  }
  .lower-third-seibert-middle .main {
    color: white;
    font-weight: 600;
    font-size: 92px;
    position: relative;
    display: flex;
    text-transform: uppercase;
    bottom: -11px;
  }
  .lower-third-seibert-middle .main .title-box.first {
    background: #cdcdcd;
  }
  .lower-third-seibert-middle .main .title-box.second {
    background: #cad333;
  }
  .lower-third-seibert-middle .main .title-box.third {
    background: #333333;
  }
  .lower-third-seibert-middle .main .text-clip {
    margin: -10px 0;
  }
  .lower-third-seibert-middle .main .text-spacer {
    margin: -10px 20px;
  }
  .lower-third-seibert-middle .main .text {
    transform: translateY(100%);
  }
  .lower-third-seibert-middle.open .main .title-box {
    animation: main-title-box-open ease-out forwards;
  }
  @keyframes main-title-box-open {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  .lower-third-seibert-middle.open .main .title-box.first {
    animation-delay: 0s;
    animation-duration: 0.6s;
  }
  .lower-third-seibert-middle.open .main .title-box .second {
    animation-delay: 0.3s;
    animation-duration: 0.5s;
  }
  .lower-third-seibert-middle.open .main .title-box .third {
    animation-delay: 0.6s;
    animation-duration: 0.5s;
  }
  .lower-third-seibert-middle.open .main .text-clip .text {
    animation: main-text-open ease-out forwards;
    animation-delay: 0.9s;
    animation-duration: 0.3s;
  }
  @keyframes main-text-open {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0%);
    }
  }
  .lower-third-seibert-middle.close .main {
    animation: main-title-box-fade ease-out backwards;
    animation-delay: 0.5s;
    animation-duration: 0.4s;
  }
  @keyframes main-title-box-fade {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  .lower-third-seibert-middle.close .main .title-box {
    animation: main-title-box-close ease-out backwards;
  }
  @keyframes main-title-box-close {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }
  .lower-third-seibert-middle.close .main .title-box.first {
    animation-delay: 0.5s;
    animation-duration: 0.4s;
  }
  .lower-third-seibert-middle.close .main .title-box .second {
    animation-delay: 0.4s;
    animation-duration: 0.4s;
  }
  .lower-third-seibert-middle.close .main .title-box .third {
    animation-delay: 0.2s;
    animation-duration: 0.4s;
  }
  .lower-third-seibert-middle.close .main .text {
    animation: main-text-close ease-out backwards;
    animation-duration: 0.3s;
  }
  @keyframes main-text-close {
    from {
      transform: translateY(0%);
    }
    to {
      transform: translateY(-100%);
    }
  }
  .lower-third-seibert-middle .sub {
    font-weight: 600;
    font-size: 56px;
    position: relative;
    display: flex;
    /*top: -10px;*/
    color: #333333;
  }
  .lower-third-seibert-middle .sub .title-box {
    background: #cad333;
  }
  .lower-third-seibert-middle .sub .text-clip {
    margin: 5px 0;
  }
  .lower-third-seibert-middle .sub .text-spacer {
    margin: 5px 10px;
  }
  .lower-third-seibert-middle .sub .text {
    transform: translateY(100%);
  }
  .lower-third-seibert-middle.open .sub .title-box {
    animation: sub-title-box-open ease-out forwards;
    animation-delay: 0.6s;
    animation-duration: 0.5s;
  }
  @keyframes sub-title-box-open {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  .lower-third-seibert-middle.open .sub .text-clip .text {
    animation: sub-text-open ease-out forwards;
    animation-delay: 0.9s;
    animation-duration: 0.3s;
  }
  @keyframes sub-text-open {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0%);
    }
  }
  .lower-third-seibert-middle.close .sub {
    animation: main-title-box-fade ease-out backwards;
    animation-delay: 0.5s;
    animation-duration: 0.4s;
  }
  @keyframes main-title-box-fade {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  .lower-third-seibert-middle.close .sub .title-box {
    animation: sub-title-box-close ease-out backwards;
    animation-delay: 0.55s;
    animation-duration: 0.4s;
  }
  @keyframes sub-title-box-close {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }
  .lower-third-seibert-middle.close .sub .text {
    animation: sub-text-close ease-out backwards;
    animation-duration: 0.3s;
  }
  @keyframes sub-text-close {
    from {
      transform: translateY(0%);
    }
    to {
      transform: translateY(-100%);
    }
  }

</style>