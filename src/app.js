/*     #region utils     */

function $(id) {
    return document.getElementById(id);
}

function log(tag='', ...contents) {
    if (contents) {
        console.log(`${tag} (below) :`);
        for (content of contents) {
            console.log();
            console.log(content);
        }
    } else {
        if (tag)
            console.log(tag);
        else
            console.log("test log (empty content)");
    }
}

/*     #endregion     */





/*     #region global variables and parameters     */

let personsData = [];   /* JSON data for every person */
let randomTree = null;  /* random Tree composed with structural PersonTreeNodes */
let initialNbPersonsInput = 1000; /* The initial 

/*  onPageLoaded is called later */

/*     #endregion     */





/*     #region Tree Model     */

/* Launched from DOM input elements. Starts the persons generating process */
async function createPersons(amount) {
    if (
        parseInt(amount) > 5000
        || ! /^[0-9]*$/.test(amount)
        || amount==0
    ) {
        $("alert").removeAttribute("hidden");
        return;
    }
    $("alert").setAttribute("hidden", null);
    // initialNbPersonsInput = amount;
    await loadPersons(amount);
    randomTree = generatePersonsRandomTree(personsData);
    const treeContainer = $("treeContainer");
    treeContainer.innerHTML = "";
    treeContainer.appendChild(applyPersonTemplate(randomTree));
}

/* Loads the JSON data from the server for all listed persons, without images */
async function loadPersons(amount) {
    $("loading").removeAttribute("hidden");
    async function fetchFile() {
        let file = await fetch(
            `https://randomuser.me/api?results=${amount}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'json',
                },
            },
        )
        .then( (response) => {
            if (response.ok)
                return response.json();
            else
                log("JSON file request : bad answer");
            log("res",response);
        })
        .then( (json) => {
            personsData = json.results;
        }).catch(async () => {
            log("JSON file request : failed")
            await new Promise((resolve) => setTimeout(resolve, 10000));
            fetchFile();
        });
    }
    await fetchFile();
    $("loading").setAttribute("hidden",'');
}

/* Generates a random full tree of persons from a JSON array */
function generatePersonsRandomTree(jsonArray) {
    let t0 = performance.now();
    class PersonTreeNode {
        constructor(parent=null, index=0) {
            this.parentNode = parent;
            this.childNodes = [];
            this.jsonIndex = index; /* data index and also DOM element ID */
        }
    }
    let jsonLowIndex = 0;
    let tree = new PersonTreeNode();
    jsonLowIndex++;
    let nodesBreadthQueue = [tree];
    while ( jsonLowIndex < jsonArray.length ) {
        let currentPerson = nodesBreadthQueue.shift();
        const remainingPersons = jsonArray.length-jsonLowIndex;
        if (remainingPersons==0)
            return;
        const randomNbchildren = Math.ceil(Math.random() * 5); /* breadth-first generating, up to 5 children */
        const nbchildren = Math.min(randomNbchildren, remainingPersons);
        for (let i=nbchildren; i>0; i--) {
            let child = new PersonTreeNode(currentPerson, jsonLowIndex++);
            currentPerson.childNodes.push(child);
            nodesBreadthQueue.push(child);
        }
    }
    let t1 = performance.now() - t0;
    log(`generatePersonsRandomTree performance (ms) with ${jsonArray.length} users`, t1)
    return tree;
}

/*     endregion     */





/*     #region Persons Views     */

/* listens the inputed keyboard events */
function nbPersonsInput($event, amount) {
    if ($event.keyCode==13)
        createPersons(amount);
}

/* defines the person's view template */
customElements.define("person-display",
    class extends HTMLElement {
        constructor(is) {
            super();
            const template = $("person-display-template").content;
            const shadowRoot = this.attachShadow({mode: 'open'});
            let newNode = template.cloneNode(true);
            shadowRoot.appendChild(newNode);
        }
    }
);

/* Unloads preloaded elements like thumbnails, when everything was loaded */
document.addEventListener("DOMContentLoaded", () => {
    let lazyBackgroundElement = document.querySelector(".lazy-background");
    if ("IntersectionObserver" in window) {
        let lazyObserver = new IntersectionObserver( (entries, observer) => {
            entries.forEach( (entry) => {
                if (entry.isIntersecting) {
                    unloadPreloadedElements();
                }
            });
        });
        lazyObserver.observe(lazyBackgroundElement);
    } else log("no intersection observer");
});

/* Creates and renders a person tree on body load */
function onPageLoaded() {
    // unloadPreloadedElements();
    if (initialNbPersonsInput != undefined) {
        const input = $('nbPersonsInput');
        input.value=initialNbPersonsInput;
        input.dispatchEvent(new KeyboardEvent('keydown', {keyCode:13}));
    }
}

/* Removes the DOM elements to unload */
function unloadPreloadedElements() {
    $('loading-image').remove();
    let lazyBackgroundElement = document.querySelector(".lazy-background");
    lazyBackgroundElement.classList.remove("lazy-background");
    lazyBackgroundElement.classList.add("background");
}

/* Develops and displays all the childs element on click */
function developChildren(personTreeNode, mustDisplay) {
    const personContainer = $("person"+personTreeNode.jsonIndex);
    if (mustDisplay) {
        const newList = document.createElement("ul");
        personContainer.appendChild(newList);
        recDevelopChild(personTreeNode, [...personTreeNode.childNodes]);
    } else {
        const ul = document.querySelector(`#person${personTreeNode.jsonIndex} ul:first-of-type`);
        if (ul) {
            for (li of document.querySelector(`#person${+personTreeNode.jsonIndex}`).querySelectorAll("ul li")) {
                li.querySelector("div person-display").shadowRoot.querySelector("#mainDiv")
                    .classList.add("close");
            }
            const timeOut = parseFloat(
                window.getComputedStyle($(`person0`).querySelector("person-display")
                .shadowRoot.querySelector("#mainDiv")).getPropertyValue("--animation-time")
            ) * 1000;
            setTimeout(() => {ul.remove()}, timeOut);
        }
    }
}

/* Recursively develops and displays each individual person */
function recDevelopChild(personTreeNode, children) {
    if (children.length==0)
        return;
    const personContainer = document.querySelector(`#person${personTreeNode.jsonIndex}`);
    const childNode = children.shift();
    const childElement = applyPersonTemplate(childNode);
    const listElement = document.createElement("li");
    listElement.appendChild(childElement);
    const unorderedList = personContainer.querySelector(`ul:first-of-type`);
    unorderedList.appendChild(listElement);
    recDevelopChild(personTreeNode, children);
}

/* Applys the shadow template for one person's display */
function applyPersonTemplate(personTreeNode) {
    const nodeData = personsData[personTreeNode.jsonIndex];
    let personContainer = document.createElement("div");
    personContainer.id = "person"+personTreeNode.jsonIndex;
    personContainer.isOpened = "false";
    let personDisplay = document.createElement("person-display");
    personDisplay.innerHTML = `
        <a slot="hasChildren"></a>
        <img slot="portrait" src="${nodeData.picture.large}" class="img" alt="portrait not found" />
        <span slot="person-name">${nodeData.name.first} ${nodeData.name.last}</span>`;
    let caretDiv = personDisplay.shadowRoot.querySelector("#mainDiv .caret-standard");
    if ( personTreeNode.childNodes.length==0 )
        caretDiv.remove()
    let recNode = personTreeNode;
    let personMainDiv = personDisplay.shadowRoot.querySelector("#mainDiv");
    let backgroundColor = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--default-person-background-color"));
    const i = 0x000D00 - 0x0D0000;
    while (recNode.parentNode!=null && backgroundColor+i<0xFFFFFF) {
        backgroundColor += i;
        recNode = recNode.parentNode;
    };
    personMainDiv.setAttribute("style",`background-color:#${backgroundColor.toString(16)}`);
    personMainDiv.onclick = (event) => {
        const isOpened = JSON.parse(personContainer.isOpened);
        personContainer.isOpened = JSON.stringify(! isOpened);
        developChildren(personTreeNode, ! isOpened );
    }
    personContainer.appendChild(personDisplay);
    return personContainer;
}

/*     #endregion     */