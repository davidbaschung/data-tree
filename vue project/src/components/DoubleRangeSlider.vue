<template>
    <div class="main" @mousedown="sliderMousedown($event)" @mousemove="sliderDrag($event)" @mouseup="sliderMouseup($event)" @mouseleave="sliderMouseLeave($event)" draggable="false">
        <div class="histogram">
            <div v-for="(bin,index) of bins" :key="index+'someBin'"
                class="bin"
                :style="binStyles[index]">
                <!-- FIXME assign height by passing it as parameter -->
            </div>
        </div>
        <div class="slider">
            <div class="track"></div>
            <div class="range"></div>
            <div class="left-handle"></div>
            <div class="right-handle"></div>
        </div>
    </div>
</template>

<script>
import { onUpdated } from 'vue';

    export default {
        name: 'double-range-slider',
        props: {
            minValue: Number,
            maxValue: Number,
            minLabel: String,
            maxLabel: String,
            dataArray: Array,
            interval: {
                type: Number,
                default: 1
            }
        },
        data() {
            return {
                isLeftHandle: Boolean,
                isClicked: false,
                leftHandleCentralPosition: Number,
                rightHandleCentralPosition: Number,
                handleRadius: 8
            }
        },
        computed: {
            sortedData() {
                return [...this.dataArray].sort(function (a,b) {return a-b});
            },
            numberOfBins() {
                let range = this.maxValue - this.minValue;
                return Math.ceil(range / this.interval);
            },
            bins() {
                let bins = new Array(this.numberOfBins).fill(0);
                for (const [index, data] of this.dataArray.entries())
                    bins[ Math.floor((data - this.minValue) / this.interval) ]++;
                return bins;
            },
            binsMaxAmount() {
                return Math.max(...this.bins);
            },
            binStyles() {
                // TODO question :
                // - reuse style tag variables?
                // - pass variables to CSS with JS initially (without getComputedStyles)?
                // - v-style with scss, not just pure css (because of CSS variables)?
                let styles = new Array(this.numberOfBins);
                for (let i=0; i<this.numberOfBins; i++) {
                    styles[i] = `
                        width:calc( var(--track-width-css) / ${this.numberOfBins} );
                        height:${ (30/this.binsMaxAmount) * this.bins[i] + "px" };
                    `;
                }
                return styles;
            },
            isMinSmallerThanMax() {
                if ( ! (this.minValue < this.maxValue))
                    console.log("WARNING : min is bigger than max");
                return null;
            }
        },
        methods: {
            sliderMousedown(event) {
                this.isClicked = true;
                this.isLeftHandle = Math.abs(event.pageX - this.leftHandleCentralPosition) < Math.abs(event.pageX - this.rightHandleCentralPosition);
                this.setHandlePosition(this.isLeftHandle, event.pageX);
            },
            sliderDrag(event) {
                if ( ! this.isClicked ) return;
                this.setHandlePosition(this.isLeftHandle, event.pageX);
            },
            sliderMouseup(event) {
                this.isClicked = false;
                // let handleDomElement;
                // if (isLeftHandle) { 
                //     handleDomElement = document.getElementsByClassName("left-handle");
                //     this.leftHandleClicked = false;
                // } else {
                //     handleDomElement = document.getElementsByClassName("right-handle");
                //     this.rightHandleClicked = false;
                // }
                // handleDomElement.draggable = false;
            },
            sliderMouseLeave(event) {
                this.isClicked = false;
            },
            setHandlePosition(isLeftHandle, handleNewCentralPosition) {
                let leftHandleDomElement = document.getElementsByClassName( "left-handle" )[0];
                let rightHandleDomElement = document.getElementsByClassName( "right-handle" )[0];
                let rangeDomElement = document.getElementsByClassName( "range" )[0];
                let trackDomElement = document.getElementsByClassName( "track" )[0];
                let trackRect = trackDomElement.getBoundingClientRect();
                if (isLeftHandle && handleNewCentralPosition>trackRect.x && handleNewCentralPosition<this.rightHandleCentralPosition) {
                    this.leftHandleCentralPosition = handleNewCentralPosition;
                    leftHandleDomElement.style.left = handleNewCentralPosition - this.handleRadius.toString() + 'px';
                    rangeDomElement.left = this.leftHandleCentralPosition;
                } else if ( !isLeftHandle && handleNewCentralPosition<trackRect.x+trackRect.width && handleNewCentralPosition>this.leftHandleCentralPosition) {
                    this.rightHandleCentralPosition = handleNewCentralPosition;
                    rightHandleDomElement.style.left = handleNewCentralPosition -this.handleRadius.toString() + 'px';
                    rangeDomElement.right = this.leftHandleCentralPosition;
                    // rangeDomElement.left = this.leftHandleCentralPosition;
                }
            }
        },
        watch: {
            
        },
        beforeCreate() {
            // let root = document.documentElement;
            // root.style.setProperty("--handle-radius", "25px;")
            /* doesn't help because of scss variables precompiling */
        },
        mounted() {
            setTimeout( () => { // TODO question no lifecycle hook for rendering?
                let mainDiv = document.getElementsByClassName('main')[0];
                let trackBoundingClientRect = mainDiv.getBoundingClientRect();
                this.leftHandleCentralPosition = trackBoundingClientRect.x + this.handleRadius;
                this.rightHandleCentralPosition = trackBoundingClientRect.x + trackBoundingClientRect.width - this.handleRadius;
                // this.setHandlePosition(true, this.leftHandleCentralPosition);
                this.setHandlePosition(false, this.rightHandleCentralPosition);
                this.setHandlePosition(true, this.leftHandleCentralPosition);
                
                // debugger
            }, 200);
        }
    }

</script>

<style lang="scss">
    :root {
        $main-width: 10em;
        $handle-radius: 8px;
        $track-width: calc($main-width - 2 * $handle-radius); //TODO question problem
        --track-width-css: #{$track-width};
    }
    div {
        margin: 0px;
        $main-width: 10em;

        & .main {
            display: flex;
            flex-flow: column;
            align-items: center;
            min-width: 10em;
            min-height: 1em;
            background-color: orange;
            -webkit-user-select: none;
            user-select: none;
        }

        & .histogram {
            max-width: 10em;
            background-color: green;
            display:block;
            
            & .bin {
                display: inline-block;
                background-color:cyan;
                border-top-left-radius:3px;
                border-top-right-radius:3px;
            }
        }

        & .slider {
            $handle-radius: 8px;
            $bar-thickness: 5px;
            $track-width: calc($main-width - 2 * $handle-radius);
            // --track-width-css: 3em;

            width: 100%;

            & .track {
                position: relative;
                width: calc(100% - 2*$handle-radius + $bar-thickness);
                /* determinant filtering width : 100% -2*handle-radius */
                height: $bar-thickness;
                background-color: whitesmoke;
                border-radius: 3px; 
                bottom : $handle-radius - $bar-thickness/2;
                left: $handle-radius - $bar-thickness/2;
            }

            & .range {
                position: absolute;
                // width determined at runtime
                width: 100px; // only for testing yet
                height: $bar-thickness;
                background-color: dodgerblue;
                bottom : $handle-radius - $bar-thickness/2;
                translate: 0 -2*$handle-radius;
            }

            & .left-handle, .right-handle {
                position: absolute;
                width: 2 * $handle-radius;
                height: 2 * $handle-radius;
                border-radius: $handle-radius;
                background-color: dodgerblue;
                translate: 0 -2*$handle-radius;

                &:hover {
                    opacity: 66%;
                    background-color: turquoise;
                    cursor: pointer;
                }

                &:active {
                    cursor: none;
                }
            }
        }
    }

</style>