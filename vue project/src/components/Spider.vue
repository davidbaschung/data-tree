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
        <div style="position:relative">
            <div class="spider-selector" @click="openWidget">
                <div class="polygon" @dragover.prevent @drop="dropPolygon($event)" :level="5"></div> <!-- must remain placed first, for relative position in CSS-->
                <span class="skill-name" hidden @drag.prevent v-for="(skill, i) of this.skills" :key="i+'skill-name'">{{skill.label}}</span>
                <div class="handle" hidden draggable="true" @dragstart="dragStartHandle" v-for="(handle,i) of value" :key="i+'handle'" :skillAxisIndex="i"></div>
                <div class="spider-web" hidden></div>
            </div>
        </div>
        <div class="overlay" hidden></div>
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
            }
        },
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
        emits: [ 'input' ],
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
            },
            dragStartHandle(event) {
                event.dataTransfer.setData('skillAxisIndex', event.target.getAttribute("skillAxisIndex"));
            },
            openWidget() {
                let spider = document.getElementsByClassName("spider-selector")[0];
                this.updatepolygonClass(spider, "closing", false);
                this.updatepolygonClass(spider, "open");
                let overlay = document.getElementsByClassName("overlay")[0];
                overlay.removeAttribute("hidden");
                overlay.classList.add("open");
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
                        element.removeAttribute("hidden");
                        element.classList.add("open");
                        element.style.left = namePositions[index][0];
                        element.style.top = namePositions[index][1];
                    }
                });
                setTimeout( () => {
                    document.querySelectorAll(".handle").forEach( (element, index) => {
                        element.removeAttribute("hidden");
                        element.classList.add("open");
                        this.setHandlePositionByPlace(element, this.skills[index].level, index);
                        element.skillAxisIndex = parseInt(index);
                    });
                    document.getElementsByClassName("spider-web")[0].removeAttribute("hidden");
                }, 500);
            },
            closeWidget() {
                let spider = document.getElementsByClassName("spider-selector")[0];
                this.updatepolygonClass(spider, "open", false);
                void spider.offsetWidth;
                this.updatepolygonClass(spider, "closing");
                setTimeout(() => this.updatepolygonClass(spider, "closing", false), 500);
                let overlay = document.getElementsByClassName("overlay")[0];
                overlay.classList.remove("open");
                void overlay.offsetWidth;
                overlay.classList.add("closing");
                document.querySelectorAll(".skill-name, .handle").forEach( (element) => {
                    element.classList.remove("open");
                    void element.offsetWidth;
                    element.classList.add("closing");
                });
                setTimeout( () => { /* hides spider for 15ms to solve the glitch flashing the opened spider */
                    overlay.setAttribute("hidden",true);
                    spider.setAttribute("hidden",true);
                }, 485);
                setTimeout(() => {
                    overlay.classList.remove("closing");
                    void overlay.offsetWidth;
                    overlay.setAttribute("hidden", true);
                    document.querySelectorAll(".skill-name, .handle").forEach( (element) => {
                        element.classList.remove("closing");
                        void element.offsetWidth;
                        element.setAttribute("hidden", true);
                        document.getElementsByClassName("spider-web")[0].setAttribute("hidden",true);
                    });
                }, 500);
                setTimeout( () => {
                    spider.removeAttribute("hidden");
                }, 510);
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
                if ( ! spider.contains(event.target) && spider.classList.contains("open"))
                    this.closeWidget();
            });
            window.addEventListener("keydown", (event) => {
                if ( ! event.keyCode == 27) return;
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
    .spider-selector.open, .spider-selector.closing {
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
    .spider-selector.open {
        animation: open__spider 0.5s normal;
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
    .skill-name.open {
        opacity: 100%;
        animation: open__spider-label 0.5s normal;
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
    .polygon.open, .polygon.closing {
        z-index:3;
        padding: 20px;
        width: calc(100% - 40px);
        height: calc(100% - 40px);
    }
    .handle {
        z-index: 6;
        position: absolute;
        /* display: none; */
        /* left: 0; */
        /* top: 0; */
        width: calc( 2 * var(--handle-radius) );
        height: calc( 2 * var(--handle-radius) );
        border-radius: var(--handle-radius);
        background-color: rgb(127, 104, 255);
        filter: brightness( 95% );
        /* width: 10px;
        height: 10px; */
        border-radius: 8px;
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
        opacity: 0%;
    }
    .overlay.open, .overlay.closing {
        opacity: 50%;
    }
    .overlay.open {
        animation: open__overlay 0.5s normal;
    }
    .overlay.closing {
        /* animation: open__overlay2 0.5s; */
        animation: open__overlay 0.5s reverse;
    }
</style>