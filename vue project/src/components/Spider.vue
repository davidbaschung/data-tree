<template>
    <div>
        <div class="spider-selector" @click="openWidget" ref="spider">
            <div class="hexagon"></div>
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
                secondaryColor: 'chartreuse'
            }
        },
        props: {
            value : {
                type: Array,
                default: () => [1,1,1,1,1,1]
            }
        },
        emits: [ 'input' ],
        methods: {
            addHexagon(context, countDown) {
                if (countDown == 0) return;
                let newHexagon = document.createElement("div");
                newHexagon.classList.add("hexagon");
                newHexagon.style.backgroundColor = countDown % 2 == 0 ? this.primaryColor : this.secondaryColor;
                context.appendChild(newHexagon);
                this.addHexagon(newHexagon, --countDown);
            },
            updateHexagonClass(context, className, isAppending=true) {
                isAppending ? context.classList.add(className) : context.classList.remove(className);
                if (context.children.length != 0)
                    this.updateHexagonClass(context.children[0], className, isAppending);
                void context.offsetWidth; /* referencing a position attribute without effect allow the CSS animation to restart on classList update */
            },
            openWidget() {
                let spider = document.getElementsByClassName("spider-selector")[0];
                this.updateHexagonClass(spider, "close", false);
                this.updateHexagonClass(spider, "open");
                let overlay = document.getElementsByClassName("overlay")[0];
                overlay.classList.add("open");
                overlay.removeAttribute("hidden");
            },
            closeWidget() {
                let spider = document.getElementsByClassName("spider-selector")[0];
                this.updateHexagonClass(spider, "open", false);
                this.updateHexagonClass(spider, "closing");
                void spider.offsetWidth;
                setTimeout(() => this.updateHexagonClass(spider, "closing", false), 500);
                let overlay = document.getElementsByClassName("overlay")[0];
                overlay.classList.remove("open");
                overlay.classList.add("closing");
                void overlay.offsetWidth;
                setTimeout(() => {
                    overlay.classList.remove("closing");
                    overlay.setAttribute("hidden", true);
                    void overlay.offsetWidth;
                }, 500);
            }
        },
        beforeCreate() {
            let root = document.documentElement;
            let hexagonWidth =  Math.cos( 30 / 180 * Math.PI );
            let widthGap = (1 - hexagonWidth) / 2;
            root.style.setProperty("--hexagon-left", widthGap * 100 + '%')
            root.style.setProperty("--hexagon-right", ( widthGap + hexagonWidth ) * 100 + '%')
        },
        mounted() {
            let spider = document.getElementsByClassName("spider-selector")[0];
            let root = document.documentElement;
            root.style.setProperty("--basis-color", this.primaryColor);
            let hexagonZero = document.getElementsByClassName("hexagon")[0];
            this.addHexagon(hexagonZero, 5);
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
    @keyframes open__spider {
        from {
            transform: scale(20%);
            top: -89px;
            border-radius: 65px;
        }
        to {
            transform: scale(100%);
            top: 20px;
            border-radius: 30px;
        }
    }
    .spider-selector {
        width: 30px;
        height: 30px;
        padding: 4px;
        background-color: dodgerblue !important;
        box-shadow: 0px 0px 3px 0px #0ff;
        border-radius: 30px;
    }
    .spider-selector.open, .spider-selector.closing {
        position: absolute;
        left: 35.3em;
        width: 240px;
        height: 240px;
        padding: 10px;
        border: 10px solid royalblue;
        box-shadow: none;
        z-index:3;
    }
    .spider-selector.open {
        animation: open__spider 0.5s normal;
    }
    .spider-selector.closing {
        animation: open__spider 0.5s reverse;
    }
    .hexagon {
        padding: 2.5px;
        width: calc(100% - 2 * 2.5px);
        height: calc(100% - 2 * 2.5px);
        clip-path: polygon(
            var(--hexagon-left) 25%,
            var(--hexagon-left) 75%,
            50% 100%,
            var(--hexagon-right) 75%,
            var(--hexagon-right) 25%,
            50% 0%
        );
        background-color: var(--basis-color);
    }
    .hexagon.open, .hexagon.closing {
        padding: 20px;
        width: calc(100% - 40px);
        height: calc(100% - 40px);
        z-index:3;
    }
    @keyframes open__overlay {
        from { opacity: 0% }
        to { opacity: 50% }
    }
    @keyframes open__overlay2 {
        to { opacity: 0% }
        from { opacity: 50% }
    }
    .overlay {
        position: absolute;
        top: 10px;
        left: 10px;
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        background-color: darkgreen;
        box-shadow: 0px 0px 10px 10px #0ff;
        opacity: 0%;
        z-index: 2;
    }
    .overlay.open, .overlay.closing {
        opacity: 50%;
    }
    .overlay.open {
        animation: open__overlay 0.5s normal;
    }
    .overlay.closing {
        animation: open__overlay2 0.5s;
        /* animation: open__overlay 0.5s reverse; */
    }
</style>