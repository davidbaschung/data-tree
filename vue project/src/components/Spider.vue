<!-- details TODO possibly
    adjust sliderRange extremas
    adjust widget absolute left
    dégradé couleur levels : 0 -> rouge, 5 -> vert
    animation des poignées
    opening vers le bas ou centre-gauche selon largeur
    skills setting callback
-->

<template>
    <div class="skills-spider" :class="transitionStates">
        <div class="overlay"></div>
        <div style="position:relative">
            <div class="spider-selector" @click="openWidget">
                <!-- <button @click="resetHandles"></button> -->
                <div class="polygon" v-for="i in 6" :key="i" :level="6-i" :style="getPolygonStyle(6-i)" @dragover.prevent @drop="dropPolygon($event)"></div> <!-- must remain placed first, for relative position in CSS-->
                <span class="skill-name" @drag.prevent v-for="(skill, i) of this.skills" :key="i+'skill-name'">{{skill.label}}</span>
                <div class="handle" draggable="true" @dragstart="dragStartHandle" v-for="(handle,i) of value" :key="i+'handle'" :skillAxisIndex="i"></div>
                <div class="spider-web" ></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

    export default {

        name: 'skills-spider',
        data() {
            return {
                primaryColor: 'limegreen',
                secondaryColor: 'chartreuse',
                skills: [],
                isOpen: false,
                isTransitioning: false,
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
            }
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
                ]
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
            getPolygonStyle(level) {
                let properties = {
                    width: `calc(100% - 2 * var(--current-polygon-padding) * ${ 5 - level } - 2 * var(--current-spider-padding) )`,
                    height: `calc(100% - 2 * var(--current-polygon-padding) * ${ 5 - level } - 2 * var(--current-spider-padding) )`,
                    top: `calc( var(--current-polygon-padding) * ${ 5 - level } + var(--current-spider-padding) )`,
                    left: `calc( var(--current-polygon-padding) * ${ 5 - level } + var(--current-spider-padding) )`,
                    'background-color': level == 0 ? "#b3ffb3" : level % 2 == 0 ?  this.secondaryColor : this.primaryColor,
                }
                return Object.entries(properties).map( ([key, value]) => key+":"+value ).join(";");
            },
            dropPolygon(event) {
                const skillAxisIndex = event.dataTransfer.getData("skillAxisIndex");
                let handleElement = document.querySelector(`.handle[skillAxisIndex='${skillAxisIndex}']`);
                this.setHandlePositionByPlace(handleElement, parseInt(event.target.getAttribute("level")), skillAxisIndex);
            },
            setHandlePositionByPlace(handleElement, skillLevel, skillAxisIndex) {
                this.skills[skillAxisIndex].level = skillLevel;
                this.$emit("input", this.skills);
                const targetPolygon = document.getElementsByClassName("polygon")[5-skillLevel];
                const polygonRect = targetPolygon.getBoundingClientRect();
                const spiderRect = document.getElementsByClassName("spider-selector")[0].getBoundingClientRect();
                const center = {x:spiderRect.width/2, y:spiderRect.height/2};
                const distance = polygonRect.height/2 - 10//TODO for polygons : compute padding*levels and centerPadding
                const axisAngleRad = (0-Math.PI/2) + Math.PI*2 / 6 * skillAxisIndex;
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
                    let spiderWeb = document.getElementsByClassName("spider-web")[0];
                    let spiderSelector = document.getElementsByClassName("spider-selector")[0];
                    let spiderSelectorRect = spiderSelector.getBoundingClientRect();
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
            openWidget() {
                let spider = document.getElementsByClassName("spider-selector")[0];
                if (spider.classList.contains("opened")) return;
                let root = document.documentElement;
                root.style.setProperty("--current-polygon-padding", '20px');
                root.style.setProperty("--current-spider-padding", '40px');
                let overlay = document.getElementsByClassName("overlay")[0];
                this.isTransitioning = true;
                this.isOpen = false;
                const namePositions = [
                    ['150px', '20px'],
                    ['295px', '90px'],
                    ['285px', '270px'],
                    ['150px', '335px'],
                    ['18px', '250px'],
                    ['18px', '100px'],
                ];
                document.querySelectorAll(".skill-name, .handle").forEach( (element, index) => {
                    if (element.classList.contains('skill-name')) {
                        element.style.left = namePositions[index][0];
                        element.style.top = namePositions[index][1];
                    }
                });
                setTimeout( () => {
                    document.querySelectorAll(".handle").forEach( (element, index) => {
                        this.isTransitioning = false;
                        this.isOpen = true;
                        this.setHandlePositionByPlace(element, this.skills[index].level, index);
                        element.skillAxisIndex = parseInt(index);
                        spider.focus();
                    });
                }, 500);
            },
            closeWidget() {
                let spider = document.getElementsByClassName("spider-selector")[0];
                let overlay = document.getElementsByClassName("overlay")[0];
                this.isTransitioning = true;
                this.isOpen = true;
                document.querySelectorAll(".skill-name, .handle").forEach( (element) => {
                });
                setTimeout( () => { /* hides spider for 30ms to solve the glitch flashing the opened spider */
                    overlay.setAttribute("style","display:none");
                    spider.setAttribute("style","display:none");
                }, 485);
                setTimeout(() => {
                        this.isTransitioning = false;
                        this.isOpen = false;
                        let root = document.documentElement;                    
                        root.style.setProperty("--current-polygon-padding", '2.5px');
                        root.style.setProperty("--current-spider-padding", '2.5px');
                        document.querySelectorAll(".skill-name, .handle").forEach( (element) => {
                    });
                }, 500);
                setTimeout( () => {
                    overlay.removeAttribute("style");
                    spider.removeAttribute("style");
                }, 515);
            }
        },
        beforeCreate() {
            let root = document.documentElement;
            let polygonWidth = Math.cos( 30 / 180 * Math.PI );
            let widthGap = (1 - polygonWidth) / 2;
            root.style.setProperty("--polygon-left", widthGap * 100 + '%')
            root.style.setProperty("--polygon-right", ( widthGap + polygonWidth ) * 100 + '%')
        },
        mounted() {
            let spider = document.getElementsByClassName("spider-selector")[0];
            let root = document.documentElement;
            window.addEventListener("click", (event) => {
                if ( ! (spider.contains(event.target)) && this.isOpened)
                    this.closeWidget();
            });
            window.addEventListener("keydown", (event) => {
                if ( event.keyCode != 27 || this.isClosed ) return;
                this.closeWidget();
            });

        }
    }
</script>

<style>
    :root {
        --handle-radius: 8px;
        --current-polygon-padding: 2.5px;
        --current-spider-padding: 2.5px;
    }
    @keyframes open__spider {
        from {
            transform: scale(20%);
            top: -147px;
            border-radius: 65px;
        }
        to {
            transform: scale(100%);
            top: 0px;
            border-radius: 30px;
        }
    }
    .spider-selector {
        width: 30px;
        height: 30px;
        padding: 4px;
        background-color: dodgerblue !important;
        box-shadow: 0px 0px 3px 0px cyan;
        border-radius: 30px;
    }
    .opening .spider-selector {
        animation: open__spider 0.5s normal;
    }
    .opening .spider-selector, .opened .spider-selector, .closing .spider-selector {
        z-index:3;
        position: absolute;
        left: -166px;
        width: 290px;
        height: 290px;
        padding: 40px;
        background-color: dodgerblue !important;
        outline: 10px solid royalblue;
        outline-offset: -10px;
        box-shadow: none;
    }
    .closing .spider-selector {
        animation: open__spider 0.5s reverse;
    }
    @keyframes open__spider-label {
        0% { opacity: 0%; }
        100% { opacity: 100%; }
    }
    .skill-name {
        z-index: 4;
        position: absolute;
        opacity: 0%;
        text-align: center;
        user-select: none;
    }
    .opening .skill-name {
        animation: open__spider-label 0.5s normal;
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
        clip-path: polygon(
            var(--polygon-left) 25%,
            var(--polygon-left) 75%,
            50% 100%,
            var(--polygon-right) 75%,
            var(--polygon-right) 25%,
            50% 0%
        );
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
    .closed .handle, .opening .handle {
        display:none;
    }
    .handle:hover {
        opacity: 66%;
        background-color: turquoise !important;
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
    .closed .spider-web, .opening .spider-web {
        display: none;
    }
    .opened .spider-web {
        display: block;
    }
    @keyframes open__overlay {
        from { opacity: 0% }
        to { opacity: 50% }
    }
    .overlay {
        z-index: 2;
        position: absolute;
        top: 10px;
        left: 10px;
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        background-color: darkgreen;
        box-shadow: 0px 0px 10px 10px #0ff;
    }
    .closed > .overlay {
        display: none;
        opacity: 0%;
    }
    .opened > .overlay, .opening > .overlay {
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