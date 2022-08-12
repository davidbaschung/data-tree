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
const INITIAL_NB_PERSONS_INPUT = 100; /* The initial number of persons inputed */
let currentlyHighlightedMainContainer; /* highlighted person */

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
    let treeContainer = $("treeContainer");
    let breadcrumbListContainer = $("breadcrumb-list");
    treeContainer.innerHTML = "";
    breadcrumbListContainer.innerHTML = "";
    treeContainer.appendChild(applyPersonTemplate(randomTree));
}

/* Loads the JSON data from the server for all listed persons, without images */
async function loadPersons(amount) {
    $("loading").removeAttribute("hidden");
    async function fetchFile() {
        await fetch(
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
    const T_0 = performance.now();
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
        const REMAINING_PERSONS = jsonArray.length-jsonLowIndex;
        if (REMAINING_PERSONS==0)
            return;
        const RANDOM_NB_CHILDREN = Math.ceil(Math.random() * 5); /* breadth-first generating, up to 5 children */
        const NB_CHILDREN = Math.min(RANDOM_NB_CHILDREN, REMAINING_PERSONS);
        for (let i=NB_CHILDREN; i>0; i--) {
            let child = new PersonTreeNode(currentPerson, jsonLowIndex++);
            currentPerson.childNodes.push(child);
            nodesBreadthQueue.push(child);
        }
    }
    const T1 = performance.now() - T_0;
    log(`generatePersonsRandomTree performance (ms) with ${jsonArray.length} users`, T1)
    return tree;
}

/* Recursively computes the absolute path for a given PersonTreeNode */
function getPersonTreeNodesPathList(personTreeNode, currentPath=[]) {
    const PARENT = personTreeNode.parentNode;
    if (PARENT == null)
        return [personTreeNode, ...currentPath];
    currentPath.unshift(personTreeNode);
    return getPersonTreeNodesPathList(PARENT, currentPath);
}

/*     #endregion     */





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
            const TEMPLATE = $("person-display-template").content;
            const SHADOW_ROOT = this.attachShadow({mode: 'open'});
            let newNode = TEMPLATE.cloneNode(true);
            SHADOW_ROOT.appendChild(newNode);
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
                    // unloadPreloadedElements();
                }
            });
        });
        lazyObserver.observe(lazyBackgroundElement);
    } else log("no intersection observer");
});

/* Creates and renders a person tree on body load */
function onPageLoaded() {
    unloadPreloadedElements();
    if (INITIAL_NB_PERSONS_INPUT != undefined) {
        let input = $('nbPersonsInput');
        input.value=INITIAL_NB_PERSONS_INPUT;
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
    let personContainer = $("person"+personTreeNode.jsonIndex);
    if (mustDisplay) {
        let newList = document.createElement("ul");
        personContainer.appendChild(newList);
        recDevelopChild(personTreeNode, [...personTreeNode.childNodes]);
    } else {
        let ul = document.querySelector(`#person${personTreeNode.jsonIndex} ul:first-of-type`);
        if (ul) {
            for (li of document.querySelector(`#person${+personTreeNode.jsonIndex}`).querySelectorAll("ul li")) {
                li.querySelector("person-display").shadowRoot.querySelector("#mainContainer")
                    .classList.add("close");
            }
            const TIME_OUT = parseFloat(
                window.getComputedStyle($(`person0`).querySelector("person-display")
                .shadowRoot.querySelector("#mainContainer")).getPropertyValue("--animation-time")
            ) * 1000;
            setTimeout(() => {ul.remove()}, TIME_OUT);
        }
    }
}

/* Recursively develops and displays each individual person */
function recDevelopChild(personTreeNode, children) {
    if (children.length==0)
        return;
    const PERSON_CONTAINER = document.querySelector(`#person${personTreeNode.jsonIndex}`);
    const CHILD_NODE = children.shift();
    const CHILD_ELEMENT = applyPersonTemplate(CHILD_NODE);
    let listElement = document.createElement("li");
    listElement.appendChild(CHILD_ELEMENT);
    let unorderedList = PERSON_CONTAINER.querySelector(`ul:first-of-type`);
    unorderedList.appendChild(listElement);
    recDevelopChild(personTreeNode, children);
}

/* Applys the shadow template for one person's display */
function applyPersonTemplate(personTreeNode) {
    const NODE_DATA = personsData[personTreeNode.jsonIndex];
    let personContainer = document.createElement("div");
    personContainer.id = "person"+personTreeNode.jsonIndex;
    personContainer.isOpened = "false";
    let personDisplay = document.createElement("person-display");
    personDisplay.innerHTML = `
        <a slot="hasChildren"></a>
        <img slot="portrait" src="${NODE_DATA.picture.medium}" class="img" alt="portrait not found" />
        <span slot="person-name">${NODE_DATA.name.first} ${NODE_DATA.name.last}</span>`;
    let caretDiv = personDisplay.shadowRoot.querySelector("#mainContainer .caret-standard");
    if ( personTreeNode.childNodes.length==0 )
        caretDiv.remove()
    let recNode = personTreeNode;
    let personMainContainer = personDisplay.shadowRoot.querySelector("#mainContainer");
    let backgroundColor = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--default-person-background-color"));
    const i = 0x000D00 - 0x0D0000;
    while (recNode.parentNode!=null && backgroundColor+i<0xFFFFFF) {
        backgroundColor += i;
        recNode = recNode.parentNode;
    };
    personMainContainer.setAttribute("style",`background-color:#${backgroundColor.toString(16)}`);
    personMainContainer.addEventListener("mainDivClick", (event) => {
        const IS_OPENED = JSON.parse(personContainer.isOpened);
        personContainer.isOpened = JSON.stringify(! IS_OPENED);
        developChildren(personTreeNode, ! IS_OPENED );
        const NODES_LIST = getPersonTreeNodesPathList(personTreeNode);
        updateBreadcrumbList(NODES_LIST);
        transmitHighlight(personMainContainer);
    }, false);
    personContainer.appendChild(personDisplay);
    return personContainer;
}

/* Displays the breadcrumb-list from an array of personTreeNodes */
function updateBreadcrumbList(personTreeNodesPathList) {
    let breadcrumbListContainer = $("breadcrumb-list");
    breadcrumbListContainer.innerHTML = "";

    for (personTreeNode of personTreeNodesPathList) {
        let li = document.createElement("li");
        let button = document.createElement("button");
        button.personTreeNode = personTreeNode
        button.onclick = (event) => {
            focusTreeOnPerson(button.personTreeNode);
        };
        const NODE_DATA = personsData[personTreeNode.jsonIndex];
        button.textContent = NODE_DATA.name.first + " " + NODE_DATA.name.last;
        li.appendChild(button);
        breadcrumbListContainer.appendChild(li);
    }
}

/* Scrolls and focuses on one given person. Launched from a breadcrumb-list button */
function focusTreeOnPerson(personTreeNode) {
    let personDisplay = document.querySelector(`#person${personTreeNode.jsonIndex} person-display`);
    let mainContainer = personDisplay.shadowRoot.querySelector('#mainContainer');
    mainContainer.scrollIntoView({behavior:"smooth"});
    let stillScrolling;
    let classList = mainContainer.classList;
    let focusWithoutScroll_Timeout = setTimeout( () => { animate(); }, 100 );
    mainContainer.addEventListener("scroll", ($event) => {
        clearTimeout(focusWithoutScroll_Timeout);
        clearTimeout(stillScrolling);
        stillScrolling = setTimeout( () => { animate(); }, 100);
    });

    function animate() {
        classList.remove("focus");
        transmitHighlight(mainContainer);
        classList.add("focus");
        mainContainer.removeEventListener("scroll", ()=>{}, true);
    }
}

/* Removes the highlight from the last hightlighted person and sets a new one */
function transmitHighlight(mainContainer) {
    mainContainer.classList.remove("open")
    mainContainer.classList.remove("highlight");
    if (currentlyHighlightedMainContainer) {
        currentlyHighlightedMainContainer.classList.remove("focus");
        currentlyHighlightedMainContainer.classList.remove("highlight");
    }
    mainContainer.classList.add("highlight");
    currentlyHighlightedMainContainer = mainContainer;
}

/*     #endregion     */