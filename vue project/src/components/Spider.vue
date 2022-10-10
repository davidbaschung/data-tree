<template>
    <div>
        <div class="spider-selector" @click="openWidget">
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
            updateHexagonClass(context, className, isRemove=false) {
                isRemove ? context.classList.remove(className) : context.classList.add(className);
                if (context.children.length != 0)
                    this.updateHexagonClass(context.children[0], className, isRemove);
            },
            openWidget() {
                let spider = document.getElementsByClassName("spider-selector")[0];
                this.updateHexagonClass(spider, "open");
                document.getElementsByClassName("overlay")[0].removeAttribute("hidden");
            },
            closeWidget() {
                let spider = document.getElementsByClassName("spider-selector")[0];
                this.updateHexagonClass(spider, "open", true);
                document.getElementsByClassName("overlay")[0].setAttribute("hidden", true);
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
            let root = document.documentElement;
            root.style.setProperty("--basis-color", this.primaryColor);
            let hexagonZero = document.getElementsByClassName("hexagon")[0];
            this.addHexagon(hexagonZero, 3);
            let spider = document.getElementsByClassName("spider-selector")[0];
            window.addEventListener("click", (event) => {
                if ( ! spider.contains(event.target))
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
    @keyfranes open {
        from {
            background-color:yellow !important;
            width: 40px;
        }
        to {
            background-color:purple !important;
            width: 250px;
        }
    }
    .spider-selector {
        width: 40px;
        height: 40px;
        padding: 4px;
        background-color: dodgerblue !important;
        border-radius: 100em;
    }
    .spider-selector.open {
        position: absolute;
        left: 38em;
        width: 200px;
        height: 200px;
        padding: 0;
        border: 10px solid royalblue;
        /* background-color: red !important; */
        animation-name: open !important;
        animation-duration: 2s;
        z-index:3;
    }
    .hexagon {
        padding: 4px;
        width: calc(100% - 8px);
        height: calc(100% - 8px);
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
    .hexagon.open {
        padding: 20px;
        width: calc(100% - 40px);
        height: calc(100% - 40px);
        z-index:3;
    }
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: darkgreen;
        opacity: 50%;
        z-index: 2;
    }
</style>