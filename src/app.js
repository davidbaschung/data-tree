/*  #region utils */

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

/* #endregion */



/*  #region runtime variables */

// let initialNbPersonsInput = 3;
let personsData = [];   /* JSON data for every person */
let randomTree = null;  /* random Tree composed with structural PersonTreeNodes */
let initialNbPersonsInput = 100;
// let domTree;            /* the HTML element with the "tree" ID */

/*  onPageLoaded is called later */

/* #endregion */



/* #region SPA methods & definitions */

customElements.define("person-display",
    class extends HTMLElement {
        constructor() {
            super();
            const template = $("person-display-template").content;
            const shadowRoot = this.attachShadow({mode: 'open'});
            let newNode = template.cloneNode(true);
            shadowRoot.appendChild(newNode);
        }
    }
);

//TODO remove
document.addEventListener("togglechildren", (customEvent) => {
    log("customevent", customEvent)
    log("id found",customEvent.detail.personID);
    log("target", customEvent.target);
    // recDisplayPersons
});

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

function onPageLoaded() {
    unloadPreloadedElements();
//     // domTree = $('tree');
    if (initialNbPersonsInput != undefined) {
        const input = $('nbPersonsInput');
        input.value=initialNbPersonsInput;
        input.dispatchEvent(new KeyboardEvent('keydown', {keyCode:13}));
    }
//     // createPersons(initialNbPersonsInput);
}

function unloadPreloadedElements() {
    $('loading-image').remove();
    let lazyBackgroundElement = document.querySelector(".lazy-background");
    lazyBackgroundElement.classList.remove("lazy-background");
    lazyBackgroundElement.classList.add("background");
}

/* generates a random full tree from a JSON array */
function generatePersonsRandomTree(jsonArray) {
    let t0 = performance.now();
    class PersonTreeNode {
        constructor(parent=null, index=0) {
            this.parentNode = parent;
            this.childNodes = [];
            this.jsonIndex = index; /* data index and also DOM element ID */
            // this.domElementNode = ... // TODO
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
            // log("new child", jsonLowIndex, child, currentPerson);
            currentPerson.childNodes.push(child);
            nodesBreadthQueue.push(child);
        }
    }
    let t1 = performance.now() - t0;
    log(`generatePersonsRandomTree performance (ms) with ${jsonArray.length} users`, t1)
    return tree;
}

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
    const treeContainer = $("person0");
    treeContainer.innerHTML = "";
    treeContainer.appendChild(applyPersonTemplate(randomTree));
}

function developChildren(personTreeNode, mustDisplay) {
    const personContainer = $("person"+personTreeNode.jsonIndex);
    if (mustDisplay) {
        const newList = document.createElement("ul");
        personContainer.appendChild(newList);
        recDevelopChild(personTreeNode, [...personTreeNode.childNodes]);
    } else {
        const ul = document.querySelector(`#person${personTreeNode.jsonIndex} ul:first-of-type`);
        if (ul)
            ul.remove();
    }
}

function recDevelopChild(personTreeNode, children) {
    if (children.length==0)
        return;
    const personContainer = document.querySelector(`#person${personTreeNode.jsonIndex}`);
    const childNode = children.shift();
    const childElement = applyPersonTemplate(childNode);
    const listElement = document.createElement("li");
    const unorderedList = personContainer.querySelector(`ul:first-of-type`);
    unorderedList.appendChild(childElement);
    personContainer.appendChild(listElement);
    recDevelopChild(personTreeNode, children);
    // const firstPerson = persons[0];
    // for (key in firstPerson) {
    //     domTree.innerHTML += `<li>${key}</li>`;
    //     if (typeof firstPerson[key] == 'string');
    // }

    // TODO show DOM tree branches from random tree
}

function applyPersonTemplate(personTreeNode) {
    // const childrenToDisplay = personTreeNode.childNodes;
    // for (let cNode of childrenToDisplay) {
    const cNode = personTreeNode; //TODO check
    const cData = personsData[cNode.jsonIndex];
    let personContainer = document.createElement("div");
    personContainer.id = "person"+cNode.jsonIndex;
    personContainer.isOpened = "false";
    let personDisplay = document.createElement("person-display");
    personDisplay.innerHTML = `
        <img slot="portrait" src="${cData.picture.large}" class="img" alt="portrait not found" />
        <span slot="first">${cData.name.first}</span>
        <span slot="last">${cData.name.last}</span>`;
    personDisplay.onclick = (event) => {
        const isOpened = JSON.parse(personContainer.isOpened);
        personContainer.isOpened = JSON.stringify(! isOpened);
        developChildren(personTreeNode, ! isOpened );
    }
    personContainer.appendChild(personDisplay);
    return personContainer;
    // }
}

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
            await new Promise((resolve) => setTimeout(resolve, 1000));
            fetchFile();
        });
    }
    await fetchFile();
    $("loading").setAttribute("hidden",'');
}

function nbPersonsInput($event, amount) {
    if ($event.keyCode==13)
        createPersons(amount);
}

/* #endregion */