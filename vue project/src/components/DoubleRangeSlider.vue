<template>
    <div class="main" @mousedown="sliderMousedown($event)" draggable="false">
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
            },
        },
        watch: {
            minValue: {
                handler(value) {
                    this.lowValue = value;
                },
                immediate: true
            },
            maxValue: {
                handler(value) {
                    this.highValue = value;
                },
                immediate: true
            }
        },
        // model: {
        //     prop: 'value',
        //     event: 'input'
        // },
        data() {
            return {
                isLeftHandle: Boolean,
                isClicked: false,
                leftHandleCentralPosition: Number,
                rightHandleCentralPosition: Number,
                handleRadius: 8,
                barThickness: 5,
                lowValue: Number,
                highValue: Number
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
                        width:calc( var(--calculation-track-width-css) / ${this.numberOfBins} );
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
                document.getElementsByClassName("left-handle")[0].classList.remove('hover-style');
                document.getElementsByClassName("right-handle")[0].classList.remove('hover-style');
                document.getElementsByClassName("range")[0].classList.remove('hover-style');
            },
            setHandlePosition(isLeftHandle, handleNewCentralPosition) {
                let leftHandleDomElement = document.getElementsByClassName( "left-handle" )[0];
                let rightHandleDomElement = document.getElementsByClassName( "right-handle" )[0];
                let rangeDomElement = document.getElementsByClassName( "range" )[0];
                let trackDomElement = document.getElementsByClassName( "track" )[0];
                let trackRect = trackDomElement.getBoundingClientRect();
                let calculationTrackWidth =  trackRect.width  - this.barThickness - 4;
                let calculationTrackLeft = trackRect.left + this.barThickness/2 + 2;
                let valueInPixels = handleNewCentralPosition - calculationTrackLeft;
                let value = (this.maxValue - this.minValue) * (valueInPixels/calculationTrackWidth);
                value =
                    value < this.minValue ? this.minValue
                    : value > this.maxValue ? this.maxValue
                    : isLeftHandle && value > this.highValue ? this.highValue
                    : ! isLeftHandle && value < this.lowValue ? this.lowValue
                    : value;
                if (isLeftHandle) {
                    if (handleNewCentralPosition>=trackRect.x+this.barThickness/2 && handleNewCentralPosition<this.rightHandleCentralPosition) {
                        this.leftHandleCentralPosition = handleNewCentralPosition;
                        leftHandleDomElement.style.left = handleNewCentralPosition - this.handleRadius.toString() + 'px';
                        rangeDomElement.style.left = handleNewCentralPosition + 'px';
                        this.lowValue = value;
                        this.$emit("lowValue", value);
                    }
                } else if ( ! isLeftHandle) {
                    if (handleNewCentralPosition<=trackRect.x+trackRect.width-this.barThickness/2 && handleNewCentralPosition>this.leftHandleCentralPosition) {
                        this.rightHandleCentralPosition = handleNewCentralPosition;
                        rightHandleDomElement.style.left = handleNewCentralPosition - this.handleRadius.toString() + 'px';
                        this.highValue = value;
                        this.$emit("highValue", value);
                    }
                }
                if ( this.isClicked ) {
                    rangeDomElement.classList.add('hover-style');
                    leftHandleDomElement.classList.add('hover-style');
                    rightHandleDomElement.classList.add('hover-style');
                }
                rangeDomElement.style.width = this.rightHandleCentralPosition - this.leftHandleCentralPosition + 'px';
            }
        },
        beforeCreate() {
            // let root = document.documentElement;
            // root.style.setProperty("--handle-radius", "25px;")
            /* doesn't help because of scss variables precompiling */
        },
        mounted() {
            window.addEventListener("mousemove", (event) => { this.sliderDrag(event)});
            window.addEventListener('mouseup', (event) => { this.sliderMouseup(event) });
            // this.$nextTick( () => {
            setTimeout( () => { // TODO question no lifecycle hook for rendering? updated and nextTick are unsuseful
                let mainDiv = document.getElementsByClassName('main')[0];
                let trackBoundingClientRect = mainDiv.getBoundingClientRect();
                this.leftHandleCentralPosition = trackBoundingClientRect.x + this.handleRadius;
                this.rightHandleCentralPosition = trackBoundingClientRect.x + trackBoundingClientRect.width - this.handleRadius;
                this.setHandlePosition(false, this.rightHandleCentralPosition);
                this.setHandlePosition(true, this.leftHandleCentralPosition);
            }, 600);
            // });
        },
    }

</script>

<style lang="scss">
    :root {
        $main-width: 10em;
        $handle-radius: 8px;
        $calculation-track-width: calc($main-width - 2 * $handle-radius); //TODO question problem
        --calculation-track-width-css: #{$calculation-track-width};
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
            -webkit-user-select: none;
            user-select: none;
        }

        & .histogram {
            max-width: 10em;
            display:block;
            
            & .bin {
                display: inline-block;
                background-color:lighten(green, 5%);
                border-top-left-radius:3px;
                border-top-right-radius:3px;
            }
        }

        & .slider {
            $handle-radius: 8px;
            $bar-thickness: 5px;
            $calculation-track-width: calc($main-width - 2 * $handle-radius);

            %hover-style {
                opacity: 66%;
                background-color: turquoise !important;
                cursor: pointer;
            }

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
                height: $bar-thickness;
                background-color: darken(dodgerblue,10%);
                translate: 0 (-1*$handle-radius -$bar-thickness/2);
            }

            & .left-handle, .right-handle {
                position: absolute;
                width: 2 * $handle-radius;
                height: 2 * $handle-radius;
                border-radius: $handle-radius;
                background-color: darken(dodgerblue,5%);
                translate: 0 -2*$handle-radius;
                padding:0px;
                margin:0px;

                &:hover {
                    @extend %hover-style;
                }
            }

            & > .hover-style {
                @extend %hover-style;
                // background-color: turquoise;
            }
            
        }
    }

</style>