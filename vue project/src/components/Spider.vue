<template>
    <div class="skills-spider" :class="[transitionStates]" ref="skillsSpider">
        <div class="overlay" ref="overlay"></div>
        <div class="widget">
            <div class="spider-selector" ref="spiderSelector" @click="openWidget">
                <div class="polygon" v-for="i in maxLevel+1" :key="i" :level="maxLevel+1-i" :ref="`level${maxLevel+1-i}`"
                    :style="getPolygonStyle(maxLevel+1-i)" @dragover.prevent @drop="dropPolygon($event)">
                </div> <!-- must remain placed first, for relative position in CSS-->
                <div class="reset-button-outline" ref="resetButton" :style="getPolygonStyle(-1.25)"></div>
                <div class="reset-button" ref="resetButton" :style="getPolygonStyle(-1.4)" @click="resetHandles">
                    <div class="centered-text">
                        {{ $store.state.params.isMobile ? 'Res.' : 'Reset'}}
                    </div>
                </div>
                <span class="skill-name" @drag.prevent v-for="(skill, i) of this.skills" :key="i+'skill-name'">
                    <div class="absolute-centered-text">
                        {{ 
                            $store.state.params.isMobile ?
                            skill.label.length <= 5 ? skill.label : skill.label.substring(0, 5)+'.'
                            : skill.label
                        }}
                    </div>
                </span>
                <div class="handle" draggable="true" @dragstart="dragStartHandle" v-for="(handle,i) of value" :key="i+'handle'" :skillAxisIndex="i"></div>
                <div class="spider-web" ref="spiderWeb"></div>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'skills-spider',
        data() {
            return {
                primaryColor: 'limegreen',
                secondaryColor: 'chartreuse',
                skills: [],
                isOpen: false,
                isTransitioning: false,
                polygonClipPath: String,
                namesPositions: [],
            }
        },
        computed: {
            // boolean classLists grouped are good
            isOpened() { return this.isOpen && ! this.isTransitioning},
            isClosed() { return ! this.isOpen && ! this.isTransitioning},
            isOpening() { return ! this.isOpen && this.isTransitioning },
            isClosing() { return this.isOpen && this.isTransitioning },
            transitionStates() {
                return {
                    opened:this.isOpened,
                    closed:this.isClosed,
                    opening:this.isOpening,
                    closing:this.isClosing
                }
            },
            openedSpiderMobilePadding() {
                return 60;
            },
            closedSpiderMobilePadding() {
                let padding = 20;
                const resetButtonWidthMobile = 64;
                if (this.isOpen) {
                    let topLevelPolygonWidth = window.screen.width - 2 - this.openedSpiderMobilePadding;
                    let paddingRange = topLevelPolygonWidth - resetButtonWidthMobile;
                    padding = paddingRange / this.maxLevel;
                    console.log(topLevelPolygonWidth, padding);
                }
                return padding;
            },
            paddings() {
                return {
                    closedPolygon: 15 / this.maxLevel,
                    closedSpider: 2.5,
                    openedSpider: this.$store.state.params.isMobile ? this.openedSpiderMobilePadding : 110,
                    openedPolygon: this.$store.state.params.isMobile ? this.closedSpiderMobilePadding : 20,
                }
            },
        },
        emits: [ 'input' ],
        props: {
            value : {
                type: Array,
                validator: (val) => 
                    val instanceof Array && val.every( skill => 
                        typeof skill.key == 'string' || skill.key instanceof String
                        && typeof skill.label == 'string' || skill.label instanceof String
                        && typeof skill.level == 'number' && skill.level % 1 === 0
                    ),
                required: false,
                default: () => [
                    {key: "skill0", label:"skill 0", level:0},
                    {key: "skill1", label:"skill 1", level:0},
                    {key: "skill2", label:"skill 2", level:0},
                    {key: "skill3", label:"skill 3", level:0},
                    {key: "skill4", label:"skill 4", level:0},
                    {key: "skill5", label:"skill 5", level:0}
                ],
            },
            maxLevel: {
                type: Number,
                validator: (max) => max <= 10,
                    // this.value.every( val => // impossible to compare to this.value, props validator are run iteratively in a for-loop
                //         val.level <= max
                    // ),
                required: false,
                default: 5,
            }
        },
        watch: {
            value: {
                handler: function (value) {
                    this.skills = value;
                },
                deep: true,
                immediate: true,
            }
        },
        methods: {
            setSpiderWidth() {
                let width = 2 * ( (this.maxLevel + 1) * this.paddings.openedPolygon ) + 2 * this.paddings.closedSpider;
                document.documentElement.style.setProperty("--spider-width", width + 'px');
            },
            getOpenedPolygonPadding() { return this.$store.state.params.isMobile ? 20 : 20 },
            getPolygonStyle(level) {
                let computerDimensions = {
                    width: `calc(100% - 2 * ( var(--current-spider-padding) + var(--current-polygon-padding) * ${ this.maxLevel - level } ) )`,
                    height: `calc(100% - 2 * ( var(--current-spider-padding) + var(--current-polygon-padding) * ${ this.maxLevel - level } ) )`,
                    top: `calc( var(--current-spider-padding) + var(--current-polygon-padding) * ${ this.maxLevel - level } )`,
                    left: `calc( var(--current-spider-padding) + var(--current-polygon-padding) * ${ this.maxLevel - level } )`,
                };
                let mobileDimensions = {
                    width: `calc(100% - 2 * ( var(--current-spider-padding) + var(--current-polygon-padding) * ${ this.maxLevel - level } ) )`,
                    height: `calc(100% - 2 * ( var(--current-spider-padding) + var(--current-polygon-padding) * ${ this.maxLevel - level } ) )`,
                    top: `calc( var(--current-spider-padding) + var(--current-polygon-padding) * ${ this.maxLevel - level } )`,
                    left: `calc( var(--current-spider-padding) + var(--current-polygon-padding) * ${ this.maxLevel - level } )`,
                };
                let properties = {
                    ... (this.$store.state.params.isMobile ? mobileDimensions : computerDimensions),
                    'background-color': level == 0 ? "#b3ffb3" : level % 2 == 0 ?  this.secondaryColor : this.primaryColor,
                    'clip-path': this.polygonClipPath,
                };
                return Object.entries(properties).map( ([key, value]) => key+":"+value ).join(";");
            },
            updatePolygonStyle() {
                let root = document.documentElement;
                let polygonPadding = this.isOpened || this.isOpening ? this.paddings.openedPolygon+'px' : this.paddings.closedPolygon+'px';
                let spiderPadding = this.isOpened || this.isOpening ? this.paddings.openedSpider+'px' : this.paddings.closedSpider+'px';
                // let polygonPadding = this.isOpen ? '20px' : '2.5px';
                // let spiderPadding = this.isOpen ? '110px' : '2.5px';;
                root.style.setProperty("--current-polygon-padding", polygonPadding);
                root.style.setProperty("--current-spider-padding", spiderPadding);
            },
            setPolygonClipPath() {
                let polygonClipPath = "polygon(";
                for (let i=0; i<this.skills.length; i++) {
                    const axisAngleRad = (0-Math.PI/2) + Math.PI*2 / this.skills.length * i;
                    const extremaPosition = {
                        x: (50 + Math.cos(axisAngleRad) * 50).toFixed(2),
                        y: (50 + Math.sin(axisAngleRad) * 50).toFixed(2),
                    };
                    polygonClipPath += `${extremaPosition.x}% ${extremaPosition.y}%, `;
                }
                polygonClipPath = polygonClipPath.substring(0,polygonClipPath.length-2) + ")";
                this.polygonClipPath = polygonClipPath;
            },
            setNamesPositions() {
                let positions = [];
                const middleWidth = this.$refs["level"+this.maxLevel][0].getBoundingClientRect().width/2;
                const containerMiddleWidth = this.$refs.spiderSelector.getBoundingClientRect().width/2;
                for (let i=0; i<this.skills.length; i++) {
                    const axisAngleRad = (0-Math.PI/2) + Math.PI*2 / this.skills.length * i;
                    let namePos;
                    if (this.$store.state.params.isMobile) {
                        namePos = [
                            (containerMiddleWidth + Math.cos(axisAngleRad) * (containerMiddleWidth - 30) + "" ).substring(0,6) + "px",
                            (containerMiddleWidth + Math.sin(axisAngleRad) * (containerMiddleWidth - 40 + 10*Math.abs(Math.cos(axisAngleRad))) + "" ).substring(0,6)  + "px",
                        ];
                    } else {
                        namePos = [
                            (containerMiddleWidth + Math.cos(axisAngleRad) * (middleWidth + 50) + "" ).substring(0,6) + "px",
                            (containerMiddleWidth + Math.sin(axisAngleRad) * (middleWidth + 15 + 20 * Math.abs(Math.cos(axisAngleRad))) + "" ).substring(0,6)  + "px",
                        ];
                    }
                    positions[i] = namePos;
                }
                this.namesPositions = positions;
            },
            dropPolygon(event) {
                const skillAxisIndex = event.dataTransfer.getData("skillAxisIndex");
                let handleElement = document.querySelector(`.handle[skillAxisIndex='${skillAxisIndex}']`);
                this.setHandlePositionByPlace(handleElement, parseInt(event.target.getAttribute("level")), skillAxisIndex);
            },
            setHandlePositionByPlace(handleElement, skillLevel, skillAxisIndex) {
                this.skills[skillAxisIndex].level = skillLevel;
                this.$emit("input", this.skills);
                const targetPolygon = document.getElementsByClassName("polygon")[this.maxLevel-skillLevel];
                const polygonRect = targetPolygon.getBoundingClientRect();
                const spiderRect = this.$refs.spiderSelector.getBoundingClientRect();
                const center = {x:spiderRect.width/2, y:spiderRect.height/2};
                const distance = polygonRect.height/2 - 10
                const axisAngleRad = (0-Math.PI/2) + Math.PI*2 / this.skills.length * skillAxisIndex;
                const handlePosition = {
                    x: center.x + Math.cos(axisAngleRad) * distance,
                    y: center.y + Math.sin(axisAngleRad) * distance
                };
                this.setHandlePositionByCenter(handleElement, handlePosition.x, handlePosition.y);
            },
            setHandlePositionByCenter(element, x, y) {
                element.style.left = x - 8 + 'px';
                element.style.top = y - 8 + 'px';
                this.$nextTick( () => {
                    let spiderWeb = this.$refs.spiderWeb;
                    let spiderSelectorRect = this.$refs.spiderSelector.getBoundingClientRect();
                    let clipPath = "polygon(";
                    const handles = document.getElementsByClassName("handle");
                    for (let h of handles) {
                        const hRect = h.getBoundingClientRect();
                        clipPath += (hRect.x-spiderSelectorRect.x+8) + "px " + (hRect.y-spiderSelectorRect.y+8) + "px, ";
                    }
                    clipPath = clipPath.substring(0, clipPath.length-2) + ")";
                    spiderWeb.style.clipPath = clipPath;
                } );
            },
            dragStartHandle(event) {
                event.dataTransfer.setData('skillAxisIndex', event.target.getAttribute("skillAxisIndex"));
            },
            resetHandles() {
                Array.prototype.forEach.call(
                    document.getElementsByClassName("handle"),
                    (handle, index) => {
                        this.setHandlePositionByPlace(handle, 0, index)
                    }
                );
            },
            openWidget() {
                if (this.isOpened) return;
                let root = document.documentElement;
                this.isTransitioning = true;
                this.isOpen = false;
                this.updatePolygonStyle();
                // root.style.setProperty("--current-polygon-padding", '20px');
                // root.style.setProperty("--current-spider-padding", '110px');
                document.body.classList.add("no-scroll");
                setTimeout( () => {
                    document.querySelectorAll(".handle").forEach( (element, index) => {
                        this.isTransitioning = false;
                        this.isOpen = true;
                        // this.updatePolygonStyle();
                        this.setHandlePositionByPlace(element, this.skills[index].level, index);
                        element.skillAxisIndex = parseInt(index);
                        this.$refs.spiderSelector.focus();
                    });
                    this.setNamesPositions();
                    document.querySelectorAll(".skill-name, .handle").forEach( (element, index) => {
                        if (element.classList.contains('skill-name')) {
                            element.style.left = this.namesPositions[index][0];
                            element.style.top = this.namesPositions[index][1];
                        }
                    });
                }, 500);
            },
            closeWidget() {
                this.isTransitioning = true;
                this.isOpen = true;
                document.body.classList.remove("no-scroll");
                setTimeout( () => { /* hides spider for 30ms to solve the glitch flashing the opened spider */
                    this.$refs.overlay.setAttribute("style","display:none");
                    this.$refs.spiderSelector.setAttribute("style","display:none");
                }, 485);
                setTimeout(() => {
                        this.isTransitioning = false;
                        this.isOpen = false;
                        this.updatePolygonStyle();
                }, 500);
                setTimeout( () => {
                    this.$refs.overlay.removeAttribute("style");
                    this.$refs.spiderSelector.removeAttribute("style");
                }, 515);
            }
        },
        created() {
            for (let i=0; i<this.skills.length; i++)
                this.namesPositions[i] = ["0px", "0px"];
                this.setSpiderWidth();
                this.updatePolygonStyle();
        },
        mounted() {
            let root = document.documentElement;
            window.addEventListener("click", (event) => {
                if ( ! (this.$refs.spiderSelector.contains(event.target)) && this.isOpened)
                    this.closeWidget();
            });
            window.addEventListener("keydown", (event) => {
                if ( event.keyCode != 27 || this.isClosed ) return;
                this.closeWidget();
            });
            this.setPolygonClipPath();
            if (this.$store.state.params.isMobile)
                this.$refs.skillsSpider.setAttribute("mobile","");
        },
        updated() {
            this.updatePolygonStyle();
        }
    }
</script>

<style>
    :root {
        --handle-radius: 8px;
        /* --current-polygon-padding: 2.5px;
        --current-spider-padding: 2.5px; */
        --reset-color-1: rgb(233, 116, 101);
        --reset-color-2: rgb(255, 141, 126);
    }
    @keyframes open__spider {
        from {
            transform: scale(20%);
            top: calc( -1 * var(--spider-width) / 2.23 );
            border-radius: 65px;
        }
        to {
            transform: scale(100%);
            top: 0px;
            border-radius: 30px;
        }
    }
    
    @keyframes open__spider--mobile {
        from {
            transform: scale(0%);
            border-radius: 65px;
        }
        to {
            transform: scale(100%);
            border-radius: 30px;
        }
    }

    .widget {
        position: relative;
    }
    .spider-selector {
        width: 30px;
        height: 30px;
        padding: 4px;
        background-color: dodgerblue !important;
        box-shadow: 0px 0px 3px 0px cyan;
        border-radius: 30px;
    }
    
    .opening:not([mobile]) .spider-selector {
        animation: open__spider 0.5s normal;
    }
    .opening:not([mobile]) .spider-selector,
    .opened:not([mobile]) .spider-selector,
    .closing:not([mobile]) .spider-selector {
        z-index:3;
        position: absolute;
        left: calc( -1 * var(--spider-width) / 2 - 25px);
        width: var(--spider-width);
        height: var(--spider-width);
        padding: 40px;
        background-color: dodgerblue !important;
        outline: 10px solid royalblue;
        outline-offset: -10px;
        box-shadow: none;
    }
    .closing:not([mobile]) .spider-selector {
        animation: open__spider 0.5s reverse;
    }
    .closed:not([mobile]) .spider-selector {
        bottom: 0px;
    }
    
    .opening[mobile] .spider-selector {
        animation: open__spider--mobile 0.5s normal;
    }
    .opening[mobile] .spider-selector,
    .opened[mobile] .spider-selector,
    .closing[mobile] .spider-selector {
        z-index:3;
        position: fixed;
        left: 2px;
        top: calc( 50vh - (100vw - 14px) / 2 );
        width: calc(100vw - 14px);
        height: calc(100vw - 14px);
        padding: 5px;
        background-color: dodgerblue !important;
        outline: 5px solid royalblue;
        outline-offset: -5px;
        box-shadow: none;
    }
    .closing[mobile] .spider-selector  {
        animation: open__spider--mobile 0.5s reverse;
    }
    .closed[mobile] .spider-selector {
        bottom: 0px;
    }

    .reset-button-outline,
    .reset-button  {
        position: absolute;
        z-index: 6;
    }
    .reset-button-outline {
        background-color: var(--reset-color-1) !important;
    }
    .opened .reset-button,
    .closing .reset-button  {
        z-index: 6;
        background-color: var(--reset-color-1) !important;
    }
    .closed .reset-button,
    .opening .reset-button,
    .closed .reset-button-outline,
    .opening.reset-button-outline {
        display: none;
    }
    .reset-button:hover {
        background-color: var(--reset-color-2) !important;
    }
    .centered-text {
        text-align: center;
        color: rgb(255, 233, 220);
        text-shadow: -2px -2px 0 var(--reset-color-1), 2px -2px 0 var(--reset-color-1), -2px 2px 0 var(--reset-color-1), 2px 2px 0 var(--reset-color-1);
        font-weight: bold;
        font-family: Sans-Serif;
    }
    :not([mobile]) .centered-text {
        transform: translate(0, 120%);
    }
    [mobile] .centered-text {
        transform: translate(0, 70%);
        font-size: smaller;
    }
    .reset-button-outline .centered-text{
        text-shadow: -2px -2px 0 var(--reset-color-1), 2px -2px 0 var(--reset-color-1), -2px 2px 0 var(--reset-color-1), 2px 2px 0 var(--reset-color-1);
    }
    @keyframes open__spider-label {
        0% { opacity: 0%; }
        100% { opacity: 100%; }
    }
    .skill-name {
        z-index: 4;
        position: absolute;
        left: 50%;
        top: 50%;
        opacity: 0%;
        text-align: center;
        user-select: none;
    }
    .absolute-centered-text {
        margin-left: -100%;
        margin-top: -10px;
    }
    .opening .skill-name {
        display: none;
    }
    .opened .skill-name {
        opacity: 100%;
    }
    .closing .skill-name {
        animation: open__spider-label 0.5s reverse;
    }
    .polygon {
        position: absolute;
        z-index:3;
        background-color: var(--basis-color);
    }
    .handle {
        z-index: 6;
        position: absolute;
        width: calc( 2 * var(--handle-radius) );
        height: calc( 2 * var(--handle-radius) );
        border-radius: var(--handle-radius);
        background-color: rgb(127, 104, 255);
        filter: brightness( 95% );
        border-radius: 8px;
    }
    .handle:hover {
        opacity: 66%;
        background-color: lightcoral !important;
        cursor: grab;
    }
    .handle:active {
        cursor: grabbing;
    }
    .spider-web {
        position: absolute;
        z-index: 5;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 50%;
        background-color: pink;
    }
    .closed .spider-web, .opening .spider-web,
    .closed .skill-name,
    .closed .handle, .opening .handle {
        display: none;
    }
    .opened .spider-web {
        display: block;
    }
    body.no-scroll {
        height: 100%;
        overflow: hidden;
        margin: 0px;
    }
    @keyframes open__overlay {
        from { opacity: 0% }
        to { opacity: 50% }
    }
    .overlay {
        z-index: 2;
        position: fixed;
        background-color: darkgreen;
    }
    :not([mobile]) .overlay {
        top: 10px;
        left: 10px;
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        box-shadow: 0px 0px 0px 40px #0ff;
        border-radius:15px;
    }
    [mobile] .overlay {
        top: 4px;
        left: 4px;
        width: calc(100% - 8px);
        height: calc(100% - 8px);
        box-shadow: 0px 0px 0px 40px #0ff;
        border-radius:15px;
    }
    .closed > .overlay {
        display: none;
        opacity: 0%;
    }
    .opened > .overlay,
    .opening > .overlay {
        display: block;
        opacity: 50%;
    }
    .opening > .overlay {
        animation: open__overlay 0.5s normal;
    }
    .closing > .overlay {
        display: block;
        animation: open__overlay 0.5s reverse;
    }
</style>