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

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return parseInt("0x" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]));
} // https://stackoverflow.com/questions/13937522/how-can-i-get-the-background-colour-from-a-style-attribute-as-a-hex-value-using


/*     #endregion     */





/*     #region global constants, variables, definitions     */

let personsData = [];   /* JSON data for every person */
let randomTree = null;  /* random Tree composed with structural PersonTreeNodes */
const INITIAL_NB_PERSONS_INPUT = 100; /* The initial number of persons inputed */
let currentlyHighlightedMainContainer; /* highlighted person */
const DEFAULT_PERSON_BACKGROUND_COLOR = 0xFF6644;
const COLOR_INCREMENT = 0x000D00 - 0x0D0000;
let selectedPersonContainer;

class PersonTreeNode {
    constructor(parent=null, index=0) {
        this.parentNode = parent;
        this.childrenNodes = [];
        this.jsonIndex = index; /* data index and also DOM element ID */
    }
}

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
    let jsonLowIndex = 0;
    let tree = new PersonTreeNode();
    jsonLowIndex++;
    let nodesBreadthQueue = [tree];
    while ( jsonLowIndex < jsonArray.length ) {
        let currentPerson = nodesBreadthQueue.shift();
        const REMAINING_PERSONS = jsonArray.length-jsonLowIndex;
        if (REMAINING_PERSONS==0)
            return;
        const RANDOM_NB_CHILDREN = Math.ceil(Math.random() * 4 + 1); /* breadth-first generating, up to 5 children */
        const NB_CHILDREN = Math.min(RANDOM_NB_CHILDREN, REMAINING_PERSONS);
        for (let i=NB_CHILDREN; i>0; i--) {
            let child = new PersonTreeNode(currentPerson, jsonLowIndex++);
            currentPerson.childrenNodes.push(child);
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

function movePersonTreeNodeToNewLocation(moved, target) {
    let nodes = moved.parentNode.childrenNodes;
    for (let [i, n] of nodes.entries()) 
        if (n == moved) {
            nodes.splice(i,1);
        }
    target.childrenNodes.push(moved);
    moved.parentNode = target;
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
    $("moving-header").setAttribute("hidden","true");
}

/* Removes the DOM elements to unload */
function unloadPreloadedElements() {
    // $('loading-image').remove(); // (Deactivated in HTML)
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
        recDevelopChild(personTreeNode, [...personTreeNode.childrenNodes]);
    } else {
        let ul = document.querySelector(`#person${personTreeNode.jsonIndex} ul:first-of-type`);
        if (ul) {
            // for (li of document.querySelector(`#person${+personTreeNode.jsonIndex}`).querySelectorAll("ul li")) {
            for (li of ul.querySelectorAll("li")) {
                li.querySelector("person-display").shadowRoot.querySelector("#mainContainer").classList.add("close");
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
    personContainer.personTreeNode = personTreeNode;
    personContainer.isOpened = "false";
    let personDisplay = document.createElement("person-display");
    personDisplay.innerHTML = `
        <a slot="hasChildren"></a>
        <img slot="portrait" src="${NODE_DATA.picture.medium}" class="img" alt="portrait not found" />
        <span slot="person-name">${NODE_DATA.name.first} ${NODE_DATA.name.last}</span>`;
    let caretDiv = personDisplay.shadowRoot.querySelector("#mainContainer .caret-standard");
    if ( personTreeNode.childrenNodes.length==0 )
        caretDiv.remove()
    let recNode = personTreeNode;
    let personMainContainer = personDisplay.shadowRoot.querySelector("#mainContainer");
    let backgroundColor = DEFAULT_PERSON_BACKGROUND_COLOR;
    while (recNode.parentNode!=null && backgroundColor+COLOR_INCREMENT<0xFFFFFF) {
        backgroundColor += COLOR_INCREMENT;
        recNode = recNode.parentNode;
    };
    personMainContainer.setAttribute("style",`background-color:#${backgroundColor.toString(16)}`);
    personMainContainer.addEventListener("personClick", (event) => {
        const IS_OPENED = JSON.parse(personContainer.isOpened);
        personContainer.isOpened = JSON.stringify(! IS_OPENED);
        developChildren(personTreeNode, ! IS_OPENED );
        const NODES_LIST = getPersonTreeNodesPathList(personTreeNode);
        updateBreadcrumbList(NODES_LIST);
        transmitHighlight(personMainContainer);
    }, false);
    personContainer.addEventListener("mousedown", ($event) => {
        selectedPersonContainer = personContainer;
    }, {capture:true});
    personContainer.addEventListener("mousedown", ($event) => {
        if (selectedPersonContainer == personContainer) {
            personMainContainer.classList.add("bubbled");
            styleChildren(personContainer.personTreeNode) ;
        } else 
            personMainContainer.classList.add("bubbled-parent");
    });
    personContainer.addEventListener("mouseup", ($event) => {
    }, {capture:true});
    personContainer.addEventListener("mouseup", ($event) => {
        $event.stopPropagation();
        let virtualPerson = new PersonTreeNode();
        let person0 = $("person0").personTreeNode;
        virtualPerson.childrenNodes = [person0];
        if (selectedPersonContainer != personContainer) {
            movePersonContainerToNewLocation(selectedPersonContainer, personContainer);
            transmitHighlight(selectedPersonContainer);
        }
        styleChildren(virtualPerson, true);
    });

    const CLASSES_TO_REMOVE = ["bubbled-parent", "bubbled", "bubbled-child"];

    function styleChildren(personTreeNode, mustRemoveStyles=false) {
        for (child of personTreeNode.childrenNodes) {
            let childPersonContainer = $("person"+child.jsonIndex);
            if (childPersonContainer != null) {
                let childPersonMainContainer = childPersonContainer.querySelector(`person-display`).shadowRoot.querySelector('#mainContainer');
                if ( ! mustRemoveStyles)
                    childPersonMainContainer.classList.add("bubbled-child");
                else {
                    for (cl of CLASSES_TO_REMOVE)
                    childPersonMainContainer.classList.remove(cl);
                }
                styleChildren(child, mustRemoveStyles);
            }
        }
    }

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
    this.addEventListener("scroll", ($event) => {
        clearTimeout(focusWithoutScroll_Timeout);
        clearTimeout(stillScrolling);
        stillScrolling = setTimeout( () => { animate(); }, 100);
    });

    function animate() {
        classList.remove("focus");
        transmitHighlight(mainContainer);
        classList.add("focus");
        this.removeEventListener("scroll", ()=>{}, true);
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

/* Displays or hides the header bar on page scrolling */
this.addEventListener("scroll", ($event) => {
    let headerElements = document.querySelectorAll("[headerElement]");
    let firstHeaderElement = headerElements[0];
    if (
        firstHeaderElement.getBoundingClientRect().top <= 0
        && ! firstHeaderElement.classList.contains("fixed")
        ) {
            $("moving-header").removeAttribute("hidden");
            let headerElements = document.querySelectorAll("[headerElement]");
            let headerElementsHeight = 0;
            for (el of headerElements) {
                elRect = el.getBoundingClientRect();
                el.initialTop = elRect.top;
                el.headerTop = headerElementsHeight;
                headerElementsHeight += elRect.height;
            }
            $("moving-header").style.height = headerElementsHeight+5+"px";
            for (el of headerElements) {
                el.classList.add("fixed");
                el.style.top = el.headerTop+"px";
            }
    }
    if (
        window.scrollY <= firstHeaderElement.initialTop
        && firstHeaderElement.classList.contains("fixed")
        ) {
            $("moving-header").setAttribute("hidden","");
            for (el of headerElements) {
                el.classList.remove("fixed");
                el.style.top = el.initialTop+"px";
            }
    }
    
});

/* Moves a person to a new location in the hierarchical tree */
async function movePersonContainerToNewLocation(movedPersonContainer, targetPersonContainer) {

    movePersonTreeNodeToNewLocation(movedPersonContainer.personTreeNode, targetPersonContainer.personTreeNode);

    let temp = document.createDocumentFragment();
    temp.appendChild(movedPersonContainer.parentElement);
    if ( ! targetPersonContainer.isOpened) {
        developChildren(targetPersonContainer.personTreeNode, true);
    }
    targetPersonContainer.querySelector(`ul:first-of-type`).appendChild(temp);

    function updateColor(personTreeNode) {
        let hexBackgroundColor = DEFAULT_PERSON_BACKGROUND_COLOR;
        let parentMainContainer = movedPersonContainer.querySelector(`#person${personTreeNode.parentNode.jsonIndex} person-display`).shadowRoot.querySelector("#mainContainer");
        let mainContainer = movedPersonContainer.querySelector(`#person${personTreeNode.jsonIndex} person-display`).shadowRoot.querySelector("#mainContainer");
        if (targetPersonContainer.parentNode!=null) {
            hexBackgroundColor = rgb2hex(parentMainContainer.style.backgroundColor);
            if (hexBackgroundColor+COLOR_INCREMENT<0xFFFFFF)
                hexBackgroundColor += COLOR_INCREMENT;
        }
        mainContainer.setAttribute("style", "background-color:#"+hexBackgroundColor.toString(16));
        let childrenNodes = personTreeNode.childrenNodes;
        for (child of childrenNodes) {
            if ($("person"+child.jsonIndex) != null)
                updateColor(child);
        }
    }

    updateColor(movedPersonContainer.personTreeNode);
        
    

    // TODO manage person0

    // TODO manage in controller
}

/*     #endregion     */





/*     #region Controller     */

function movePersonToNewLocation() {
    //TODO
}

// TODO a controller for inputs & clicks

/*     #endregion     */