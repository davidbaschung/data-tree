<!-- details TODO possibly
    adjust sliderRange extremas
    adjust widget absolute left
    dégradé couleur levels : 0 -> rouge, 5 -> vert
    animation des poignées
    opening vers le bas ou centre-gauche selon largeur
    skills setting callback
-->

<template>
    <div>
        <div class="overlay" :class="transitionStates"></div>
        <div style="position:relative">
            <div class="spider-selector" :class="transitionStates" @click="openWidget">
                <!-- <button @click="resetHandles"></button> -->
                <div class="polygon" @dragover.prevent @drop="dropPolygon($event)" :level="5"></div> <!-- must remain placed first, for relative position in CSS-->
                <span class="skill-name" :class="transitionStates" @drag.prevent v-for="(skill, i) of this.skills" :key="i+'skill-name'">{{skill.label}}</span>
                <div class="handle" :class="transitionStates" draggable="true" @dragstart="dragStartHandle" v-for="(handle,i) of value" :key="i+'handle'" :skillAxisIndex="i"></div>
                <div class="spider-web" :class="transitionStates"></div>
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
            }
        },
        computed: {
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
                // default: () => [1,1,1,1,1,1]
            }
        },
        watch: {
            value: {
                handler: function (value) {
                    this.skills = value;
                },
                deep: true,
                immediate: true
                // TODO basic data controlling and typing in watcher or prop declaration
            }
        },
        methods: {
            addpolygon(context, countDown) {
                if (countDown < 0) return;
                let newpolygon = document.createElement("div");
                newpolygon.setAttribute("level",countDown);
                newpolygon.classList.add("polygon");
                newpolygon.style.backgroundColor = countDown % 2 == 0 ?  this.secondaryColor : this.primaryColor;
                if (countDown == 0)
                    newpolygon.style.backgroundColor = "#b3ffb3";
                context.appendChild(newpolygon);
                this.addpolygon(newpolygon, --countDown);
            },
            dropPolygon(event) {
                const skillAxisIndex = event.dataTransfer.getData("skillAxisIndex");
                let handleElement = document.querySelector(`.handle[skillAxisIndex='${skillAxisIndex}']`);
                this.setHandlePositionByPlace(handleElement, parseInt(event.target.getAttribute("level")), skillAxisIndex);
            },
            updatepolygonClass(context, className, isAppending=true) {
                isAppending ? context.classList.add(className) : context.classList.remove(className);
                if (context.children.length != 0)
                    this.updatepolygonClass(context.children[0], className, isAppending);
                void context.offsetWidth; /* referencing a position attribute without effect allow the CSS animation to restart on classList update */
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
                        h.offsetWidth;
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
                this.updatepolygonClass(spider, "closed", false);
                this.updatepolygonClass(spider, "opened");
                let overlay = document.getElementsByClassName("overlay")[0];
                this.isTransitioning = true;
                this.isOpen = false;
                let namePositions = [
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
                        void overlay.offsetWidth;
                    });
                }, 500);
            },
            closeWidget() {
                let spider = document.getElementsByClassName("spider-selector")[0];
                void spider.offsetWidth;
                let overlay = document.getElementsByClassName("overlay")[0];
                this.isTransitioning = true;
                this.isOpen = true;
                void overlay.offsetWidth;
                this.updatepolygonClass(spider, "opened", false);
                this.updatepolygonClass(spider, "closing");
                document.querySelectorAll(".skill-name, .handle").forEach( (element) => {
                    void element.offsetWidth;
                });
                setTimeout( () => { /* hides spider for 30ms to solve the glitch flashing the opened spider */
                    overlay.setAttribute("style","display:none");
                    spider.setAttribute("style","display:none");
                }, 485);
                setTimeout(() => {
                    this.isTransitioning = false;
                    this.isOpen = false;
                    this.updatepolygonClass(spider, "closing", false), 500;
                    void overlay.offsetWidth;
                    document.querySelectorAll(".skill-name, .handle").forEach( (element) => {
                        void element.offsetWidth;
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
            let polygonWidth =  Math.cos( 30 / 180 * Math.PI );
            let widthGap = (1 - polygonWidth) / 2;
            root.style.setProperty("--polygon-left", widthGap * 100 + '%')
            root.style.setProperty("--polygon-right", ( widthGap + polygonWidth ) * 100 + '%')
        },
        mounted() {
            let spider = document.getElementsByClassName("spider-selector")[0];
            let root = document.documentElement;
            root.style.setProperty("--basis-color", this.primaryColor);
            let topPolygon = document.getElementsByClassName("polygon")[0];
            this.addpolygon(topPolygon, 5 - 1);
            window.addEventListener("click", (event) => {
                if ( ! spider.contains(event.target) && spider.classList.contains("opened"))
                    this.closeWidget();
            });
            window.addEventListener("keydown", (event) => {
                if ( event.keyCode != event.code.escape || spider.classList.contains("opened")) return;
                this.closeWidget();
            });

        }
    }
</script>

<style>
    :root {
        --handle-radius: 8px;
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
    .spider-selector.opening {
        animation: open__spider 0.5s normal;
    }
    .spider-selector.opening, .spider-selector.opened, .spider-selector.closing {
        z-index:3;
        position: absolute;
        left: -155px;
        width: 290px;
        height: 290px;
        padding: 40px;
        background-color: dodgerblue !important;
        outline: 10px solid royalblue;
        outline-offset: -10px;
        box-shadow: none;
    }
    .spider-selector.closing {
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
    .skill-name.opening {
        animation: open__spider-label 0.5s normal;
    }
    .skill-name.opened {
        opacity: 100%;
    }
    .skill-name.closing {
        animation: open__spider-label 0.5s reverse;
    }
    .polygon {
        position: relative;
        padding: 2.5px;
        width: calc(100% - 2 * 2.5px);
        height: calc(100% - 2 * 2.5px);
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
    .polygon.opened, .polygon.closing {
        z-index:3;
        padding: 20px;
        width: calc(100% - 40px);
        height: calc(100% - 40px);
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
    .handle.closed, .handle.opening {
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
    .spider-web.closed, .spider-web.opening {
        display: none;
    }
    .spider-web.opened {
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
    .overlay.closed {
        display: none;
        opacity: 0%;
    }
    .overlay.opened, .overlay.opening {
        display: block;
        opacity: 50%;
    }
    .overlay.opening {
        animation: open__overlay 0.5s normal;
    }
    .overlay.closing {
        display: block;
        animation: open__overlay 0.5s reverse;
    }
</style>