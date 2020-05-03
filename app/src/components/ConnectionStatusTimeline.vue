<template>

  <section class="cd-horizontal-timeline">
    <div
      class="timeline"
      :class="{ loaded: loaded }"
      style="max-width: 556px;"
    >

      <div class="events-wrapper">
        <div
          class="events"
          ref="eventsWrapper"
        >
          <li><a
              ref="eventStandby"
              data-date="01/01/2017"
              data-index="0"
              class="selected"
              @click="handleClick"
            >Standby</a></li>
          <li><a
              ref="eventRoomFound"
              data-date="01/01/2018"
              data-index="1"
              @click="handleClick"
            >Room Found</a></li>
          <li><a
              ref="eventConnected"
              data-date="01/01/2019"
              data-index="2"
              @click="handleClick"
            >Connected</a></li>
          <li><a
              ref="eventPlaying"
              data-date="01/01/2020"
              data-index="3"
              @click="handleClick"
            >Playing</a></li>

          <span
            class="filling-line"
            aria-hidden="true"
            ref="fillingLine"
          ></span>
        </div>
      </div>
    </div> <!-- .events -->
  </section>

</template>

<script>
const TIMELINE_ITEM_COUNT = 4

export default {
  mounted () {
    this.initTimeline();
  },
  data () {
    return {
      timelineComponents: {},
      eventsMinDistance: 150,
      loaded: false,
      timelineWidth: 0
    }
  },
  methods: {
    handleClick (e) {
      this.timelineComponents['timelineEvents'].forEach(element => {
        element.classList.remove('selected')
      })
      e.target.classList.add('selected');
      this.updateOlderEvents(e.target);
      this.updateFilling(e.target, this.timelineComponents['fillingLine'], this.timelineWidth);
    },
    initTimeline () {

      this.timelineComponents['eventsWrapper'] = this.$refs.eventsWrapper
      this.timelineComponents['fillingLine'] = this.$refs.fillingLine
      this.timelineComponents['timelineEvents'] = Array.prototype.slice.call(this.$refs.eventsWrapper.getElementsByTagName("li")).map(element => element.getElementsByTagName("a")[0]);
      this.timelineComponents['timelineDates'] = this.timelineComponents['timelineEvents'].map(element => this.parseDate(element));
      this.timelineComponents['eventsMinLapse'] = this.minLapse(this.timelineComponents['timelineDates']);
      this.timelineWidth = this.setTimelineWidth(this.timelineComponents, this.eventsMinDistance);
      this.setDatePosition(this.timelineComponents, this.eventsMinDistance, this.timelineWidth);
      this.loaded = true;
    },
    parseDate (event) {
      const dateComp = event.getAttribute('data-date').split('/');
      return new Date(dateComp[2], dateComp[1] - 1, dateComp[0]);
    },
    daydiff (first, second) {
      return Math.round((second - first))
    },
    setDatePosition (timelineComponents, stepDistance, totalWidth) {
      for (let i = 0; i < timelineComponents['timelineDates'].length; i++) {
        var timelineEventWidth = window.getComputedStyle(this.timelineComponents['timelineEvents'][i]).getPropertyValue('width');
        timelineEventWidth = Number(timelineEventWidth.replace('px', ''))
        const offset = ((i / TIMELINE_ITEM_COUNT) * totalWidth) + 24
        timelineComponents['timelineEvents'][i].style['left'] = offset + 'px';
      }
    },
    setTimelineWidth (timelineComponents, width) {
      const timeSpan = this.daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][timelineComponents['timelineDates'].length - 1])
      const timeSpanNorm = Math.round(timeSpan / timelineComponents['eventsMinLapse']) + 1
      // const totalWidth = timeSpanNorm * width;
      const totalWidth = timeSpanNorm * width;
      timelineComponents['eventsWrapper'].style['width'] = totalWidth + 'px';
      this.updateFilling(timelineComponents['timelineEvents'][0], timelineComponents['fillingLine'], totalWidth);
      return totalWidth;
    },
    updateFilling (selectedEvent, filling, totalWidth) {
      const timelineWidth = this.$refs.eventsWrapper.style['width']
      const selectedEventIndex = selectedEvent.getAttribute('data-index')
      var timelineEventWidth = window.getComputedStyle(selectedEvent).getPropertyValue('width');
      timelineEventWidth = Number(timelineEventWidth.replace('px', ''))
      const fillValue = ((selectedEventIndex / TIMELINE_ITEM_COUNT) * totalWidth) + (timelineEventWidth / 2) + 24
      var scaleValue = fillValue / totalWidth
      if (selectedEventIndex == (TIMELINE_ITEM_COUNT - 1)) scaleValue = 1.00
      this.setTransformValue(filling, 'scaleX', scaleValue);
    },
    updateOlderEvents (event) {
      const eventIndex = parseInt(event.getAttribute('data-index'))
      console.log(eventIndex)
      for (let i = 0; i < this.timelineComponents['timelineEvents'].length; i++) {
        if (i < eventIndex) this.timelineComponents['timelineEvents'][i].classList.add('older-event')
        if (i >= eventIndex) this.timelineComponents['timelineEvents'][i].classList.remove('older-event')
      }
    },
    setTransformValue (element, property, value) {
      element.style["-webkit-transform"] = property + "(" + value + ")";
      element.style["-moz-transform"] = property + "(" + value + ")";
      element.style["-ms-transform"] = property + "(" + value + ")";
      element.style["-o-transform"] = property + "(" + value + ")";
      element.style["transform"] = property + "(" + value + ")";
    },
    minLapse (dates) {
      var dateDistances = [];
      for (let i = 1; i < dates.length; i++) {
        var distance = this.daydiff(dates[i - 1], dates[i]);
        dateDistances.push(distance);
      }
      return Math.min.apply(null, dateDistances);
    }
  },
}
</script>

<style>
@import url(https://fonts.googleapis.com/css?family=Source+Sans+Pro);

.cd-horizontal-timeline {
  font-size: 24px !important;
  font-family: "Source Sans Pro", sans-serif;
  color: #383838;
}

a {
  color: #0099ff;
  text-decoration: none;
}

/* -------------------------------- 

Main Components 

-------------------------------- */
.loaded {
  /* show the timeline after events position has been set (using JavaScript) */
  opacity: 1;
}
.timeline {
  height: 100px;
  margin: 0 auto;
}
.events-wrapper {
  position: relative;
  height: 100%;
  overflow: hidden;
}
.events-wrapper::after,
.events-wrapper::before {
  /* these are used to create a shadow effect at the sides of the timeline */
  content: "";
  position: absolute;
  z-index: 2;
  top: 0;
  height: 100%;
  width: 20px;
}

.events {
  /* this is the grey line/timeline */
  position: absolute;
  z-index: 1;
  left: 0;
  top: 49px;
  height: 2px;
  /* width will be set using JavaScript */
  background: #dfdfdf;
  -webkit-transition: -webkit-transform 0.4s;
  -moz-transition: -moz-transform 0.4s;
  transition: transform 0.4s;
}
.filling-line {
  /* this is used to create the green line filling the timeline */
  position: absolute;
  z-index: 1;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: #0099ff;
  -webkit-transform: scaleX(0);
  -moz-transform: scaleX(0);
  -ms-transform: scaleX(0);
  -o-transform: scaleX(0);
  transform: scaleX(0);
  -webkit-transform-origin: left center;
  -moz-transform-origin: left center;
  -ms-transform-origin: left center;
  -o-transform-origin: left center;
  transform-origin: left center;
  -webkit-transition: -webkit-transform 0.3s;
  -moz-transition: -moz-transform 0.3s;
  transition: transform 0.3s;
}
.events a {
  position: absolute;
  bottom: 0;
  z-index: 2;
  text-align: center;
  font-size: 16px;
  padding-bottom: 15px;
  color: #383838;
  /* fix bug on Safari - text flickering while timeline translates */
  -webkit-transform: translateZ(0);
  -moz-transform: translateZ(0);
  -ms-transform: translateZ(0);
  -o-transform: translateZ(0);
  transform: translateZ(0);
  cursor: default;
}
.events a::after {
  /* this is used to create the event spot */
  content: "";
  position: absolute;
  left: 50%;
  right: auto;
  -webkit-transform: translateX(-50%);
  -moz-transform: translateX(-50%);
  -ms-transform: translateX(-50%);
  -o-transform: translateX(-50%);
  transform: translateX(-50%);
  bottom: -5px;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  border: 2px solid #dfdfdf;
  background-color: #f8f8f8;
  -webkit-transition: background-color 0.3s, border-color 0.3s;
  -moz-transition: background-color 0.3s, border-color 0.3s;
  transition: background-color 0.3s, border-color 0.3s;
}
.no-touch .events a:hover::after {
  cursor: default;
}
.events a.selected {
  pointer-events: none;
}
.events a.selected::after {
  background-color: #0099ff;
  border-color: #0099ff;
}
.events a.older-event::after {
  border-color: #0099ff;
  background-color: #0099ff;
}

@-webkit-keyframes cd-enter-right {
  0% {
    opacity: 0;
    -webkit-transform: translateX(100%);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateX(0%);
  }
}
@-moz-keyframes cd-enter-right {
  0% {
    opacity: 0;
    -moz-transform: translateX(100%);
  }
  100% {
    opacity: 1;
    -moz-transform: translateX(0%);
  }
}
@keyframes cd-enter-right {
  0% {
    opacity: 0;
    -webkit-transform: translateX(100%);
    -moz-transform: translateX(100%);
    -ms-transform: translateX(100%);
    -o-transform: translateX(100%);
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateX(0%);
    -moz-transform: translateX(0%);
    -ms-transform: translateX(0%);
    -o-transform: translateX(0%);
    transform: translateX(0%);
  }
}
@-webkit-keyframes cd-enter-left {
  0% {
    opacity: 0;
    -webkit-transform: translateX(-100%);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateX(0%);
  }
}
@-moz-keyframes cd-enter-left {
  0% {
    opacity: 0;
    -moz-transform: translateX(-100%);
  }
  100% {
    opacity: 1;
    -moz-transform: translateX(0%);
  }
}
@keyframes cd-enter-left {
  0% {
    opacity: 0;
    -webkit-transform: translateX(-100%);
    -moz-transform: translateX(-100%);
    -ms-transform: translateX(-100%);
    -o-transform: translateX(-100%);
    transform: translateX(-100%);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateX(0%);
    -moz-transform: translateX(0%);
    -ms-transform: translateX(0%);
    -o-transform: translateX(0%);
    transform: translateX(0%);
  }
}
</style>