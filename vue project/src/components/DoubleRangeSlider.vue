<template>
    <div class="main">
        <div class="histogram">
            <div v-for="(bin,index) of bins" :key="index+'someBin'"
                class="bin"
                :style="binStyles[index]">
                <!-- FIXME assign height by passing it as parameter -->
            </div>
        </div>
        <div class="slider">
            <div class="track"></div>
            <div class="left-handle" @dragenter.prevent.stop @drag.prevent.stop="handleDrag($event, true)" @dragover.prevent.stop @dragleave.prevent.stop @drop.prevent.stop draggable="true"></div>
            <div class="right-handle" @dragenter.prevent.stop  @drag.prevent.stop="handleDrag($event, false)" @dragover.prevent.stop @dragleave.prevent.stop @drop.prevent.stop draggable="true"></div>
        </div>
    </div>
</template>

<script>
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
            handleDrag(event, isLeftHandle) {
                // console.log(event);
                let domElement = document.getElementsByClassName( isLeftHandle ? "left-handle" : "right-handle" )[0];
                let handleRadius = 8; // TODO question
                domElement.style.left = event.pageX - handleRadius + "px";
                console.log("dom el left : ",domElement.style.left);
            },
        },
        watch: {
            
        },
        beforeCreate() {
            let root = document.documentElement;
            root.style.setProperty("--handle-radius", "8px;")
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
                height: $bar-thickness;
                background-color: whitesmoke;
                border-radius: 3px;
                bottom : $handle-radius - $bar-thickness/2;
                left: $handle-radius - $bar-thickness/2;
            }

            & .left-handle, .right-handle {
                position: absolute;
                width: 2 * $handle-radius;
                height: 2 * $handle-radius;
                border-radius: $handle-radius;
                background-color: dodgerblue ;
                -webkit-user-drag: element;

                &:hover {
                    opacity: 66%;
                    background-color: turquoise;
                }
            }

            & .left-handle {
                translate: 0 -2*$handle-radius
            }

            & .right-handle {
                translate: calc($main-width - 2*$handle-radius) -2*$handle-radius;
            }
        }
    }

</style>