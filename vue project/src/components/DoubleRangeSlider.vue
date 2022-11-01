<template>
    <div ref="doubleRangeSlider" class="double-range-slider" @mousedown="sliderMousedown($event)" draggable="false">
        <div class="histogram">
            <!-- TODO??? compute bin styles only once -->
            <div v-for="(bin,index) of binsHeight" :key="index+'someBin'"
                class="bin"
                :style="binStyles[index]">
                <!-- FIXME assign height by passing it as parameter -->
            </div>
        </div>
        <div class="slider">
            <div ref="track" class="track"></div>
            <div ref="range" class="range"></div>
            <div ref="leftHandle" class="left-handle"></div>
            <div ref="rightHandle" class="right-handle"></div>
        </div>
    </div>
</template>

<script>
import { onUpdated } from 'vue';

    export default {
        name: 'double-range-slider',
        props: {
            value: Object,
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
        emits: [ 'input' ],
        watch: {
            value: {
                handler(loHiValues) {
                    this.lowValue = loHiValues.lowValue;
                    this.highValue = loHiValues.highValue;
                },
                immediate: true
            },
        },
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
            binsHeight() {
                let binsHeight = new Array(this.numberOfBins).fill(0);
                for (const [index, data] of this.dataArray.entries())
                    binsHeight[ Math.floor((data - this.minValue) / this.interval) ]++;
                return binsHeight;
            },
            binsMaxAmount() {
                return Math.max(...this.binsHeight);
            },
            binStyles() {
                // - reuse style tag variables?
                // - pass variables to CSS with JS initially (without getComputedStyles)?
                // - v-style with scss, not just pure css (because of CSS variables)?
                let styles = new Array(this.numberOfBins);
                for (let i=0; i<this.numberOfBins; i++) {
                    styles[i] = `
                        width:calc( 100% / ${this.numberOfBins} );
                        height:${ (30/this.binsMaxAmount) * this.binsHeight[i] + "px" };
                    `;
                }
                return styles;
            },
            isMinSmallerThanMax() {
                if ( ! (this.minValue < this.maxValue))
                    console.log("WARNING : min is bigger than max");
                return null;
            },
            calculationTrackWidth() {
                // let trackDomElement = document.getElementsByClassName( "track" )[0];
                // const trackRect = trackDomElement.getBoundingClientRect();
                return this.trackRect.width  - this.barThickness - 4;
            },
            calculationTrackLeft() {
                // let trackDomElement = document.getElementsByClassName( "track" )[0];
                // const trackRect = trackDomElement.getBoundingClientRect();
                return this.trackRect.left + this.barThickness/2 + 2;
            },
            trackRect() {
                return this.$refs.track.getBoundingClientRect();
            }
        },
        methods: {
            sliderMousedown(event) {
                this.isClicked = true;
                this.isLeftHandle = Math.abs(event.pageX - this.leftHandleCentralPosition) < Math.abs(event.pageX - this.rightHandleCentralPosition);
                this.isLeftHandle ? this.setLeftHandlePosition(event.pageX) : this.setRightHandlePosition(event.pageX);
            },
            sliderDrag(event) {
                if ( ! this.isClicked ) return;
                this.isLeftHandle ? this.setLeftHandlePosition(event.pageX) : this.setRightHandlePosition(event.pageX);
            },
            sliderMouseup(event) {
                this.isClicked = false;
                this.$refs.leftHandle.classList.remove('hover-style');
                this.$refs.rightHandle.classList.remove('hover-style');
                this.$refs.range.classList.remove('hover-style');
            },
            setLeftHandlePosition(handleNewCentralPosition) {
                this.setHandlePosition(true, handleNewCentralPosition);
            },
            setRightHandlePosition(handleNewCentralPosition) {
                this.setHandlePosition(false, handleNewCentralPosition);
            },
            setHandlePosition(isLeftHandle, handleNewCentralPosition) {
                // NOTE : getElementyBy are expensive, using refs is better. Use refs with $refs everywhere, getElementsByClassName can mess up with rendering
                let valueInPixels = handleNewCentralPosition - this.calculationTrackLeft;
                let currentValue = (this.maxValue - this.minValue) * (valueInPixels/this.calculationTrackWidth);
                currentValue =
                    currentValue < this.minValue ? this.minValue
                    : currentValue > this.maxValue ? this.maxValue
                    : isLeftHandle && currentValue > this.highValue ? this.highValue
                    : ! isLeftHandle && currentValue < this.lowValue ? this.lowValue
                    : currentValue;
                if (isLeftHandle) {
                    if (handleNewCentralPosition>=this.trackRect.x+this.barThickness/2 && handleNewCentralPosition<this.rightHandleCentralPosition) {
                        this.leftHandleCentralPosition = handleNewCentralPosition;
                        this.$refs.leftHandle.style.left = handleNewCentralPosition - this.handleRadius.toString() + 'px';
                        this.$refs.range.style.left = handleNewCentralPosition + 'px';
                        this.lowValue = currentValue;
                        this.$emit("input", { ...{"lowValue":currentValue, "highValue":this.highValue}});
                    }
                } else if ( ! isLeftHandle) {
                    if (handleNewCentralPosition<=this.trackRect.x+this.trackRect.width-this.barThickness/2 && handleNewCentralPosition>this.leftHandleCentralPosition) {
                        this.rightHandleCentralPosition = handleNewCentralPosition;
                        this.$refs.rightHandle.style.left = handleNewCentralPosition - this.handleRadius.toString() + 'px';
                        this.highValue = currentValue;
                        this.$emit("input", { ...{"lowValue":this.lowValue, "highValue":currentValue}});
                    }
                }
                if ( this.isClicked ) {
                    this.$refs.range.classList.add('hover-style');
                    this.$refs.leftHandle.classList.add('hover-style');
                    this.$refs.rightHandle.classList.add('hover-style');
                }
                this.$refs.range.style.width = this.rightHandleCentralPosition - this.leftHandleCentralPosition + 'px';
            }
        },
        beforeCreate() {
            let root = document.documentElement;

            root.style.setProperty("--main-width", "10em");
            root.style.setProperty("--handle-radius", "8px");
            root.style.setProperty("--calculation-track-width", "calc(var(--main-width) - 2 * var(--handle-radius))");

            /* doesn't help because of scss variables precompiling */
        },
        mounted() {
            window.addEventListener("mousemove", (event) => { this.sliderDrag(event)});
            window.addEventListener('mouseup', (event) => { this.sliderMouseup(event) });
            this.$nextTick( () => {
                // let mainDiv = this.$refs.doubleRangeSlider;
                const mainDivBoundingClientRect = this.$refs.doubleRangeSlider.getBoundingClientRect();
                this.leftHandleCentralPosition = mainDivBoundingClientRect.x + this.handleRadius;
                this.rightHandleCentralPosition = mainDivBoundingClientRect.x + mainDivBoundingClientRect.width - this.handleRadius;
                this.setLeftHandlePosition(this.leftHandleCentralPosition);
                this.setRightHandlePosition(this.rightHandleCentralPosition);
            });
        },
    }

</script>

<style lang="scss">
    :root {
        // modular variables set at runtime :
        // --handle-radius
        // --main-width
        // --calculation-track-width
        width: 100%;
    }
    div {
        margin: 0px;

        & .main {
            display: flex;
            flex-flow: column;
            align-items: center;
            min-width: 10em;
            min-height: 1em;
            -webkit-user-select: none;
            user-select: none;
            width: var(--calculation-track-width);
        }

        & .histogram {
            width: var(--calculation-track-width);
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
            $bar-thickness: 5px;

            %hover-style {
                opacity: 66%;
                background-color: turquoise !important;
                cursor: pointer;
            }

            width: 100%;

            & .track {
                position: relative;
                width: calc(100% - 2* var(--handle-radius) + $bar-thickness);
                /* determinant filtering width : 100% -2*handle-radius */
                height: $bar-thickness;
                background-color: whitesmoke;
                border-radius: 3px; 
                bottom : calc( var(--handle-radius) - $bar-thickness/2 );
                left: calc( var(--handle-radius) - $bar-thickness/2 );
            }

            & .range {
                position: absolute;
                translate: 0 calc(-1*var(--handle-radius) - $bar-thickness/2);
                // width determined at runtime
                height: $bar-thickness;
                background-color: darken(dodgerblue,10%);
            }

            & .left-handle, .right-handle {
                position: absolute;
                width: calc( 2 * var(--handle-radius) );
                height: calc( 2 * var(--handle-radius) );
                border-radius: var(--handle-radius);
                background-color: darken(dodgerblue,5%);
                translate: 0 calc( -2 * var(--handle-radius) );
                padding: 0px;
                margin: 0px;

                &:hover {
                    @extend %hover-style;
                }
            }

            & > .hover-style {
                @extend %hover-style;
            }
            
        }
    }

</style>