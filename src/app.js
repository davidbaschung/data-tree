/*  #region utils */

function $(id) {
    return document.getElementById(id);
}

function log(tag='', ...contents) {
    if (contents) {
        console.log(`${tag} (below) :`);
        for (content of contents) {
            console.log(content);
            console.log();
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
            shadowRoot.appendChild(template.cloneNode(true));
        }
    }
);

document.addEventListener("DOMContentLoaded", () => {
    let lazyBackgroundElement = document.querySelector(".lazy-background");

    if ("IntersectionObserver" in window) {
        let lazyObserver = new IntersectionObserver( (entries, observer) => {
            entries.forEach( (entry) => {
                if (entry.isIntersecting) {
                    lazyBackgroundElement.classList.remove("lazy-background");
                    lazyBackgroundElement.classList.add("background");
                    // lazyObserver.unobserve( "no src in html" );
                }
            });
        });
        lazyObserver.observe(lazyBackgroundElement);
    } else log("no intersection observer");
});

function onPageLoaded() {
//     let lazyBackgroundElement = document.querySelector(".lazy-background");
//     lazyBackgroundElement.classList.remove("lazy-background");
//     lazyBackgroundElement.classList.add("background");
//     // const perfData = window.performance.timing;
//     // const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
//     // log("Page loaded. rendering time", pageLoadTime);
//     // domTree = $('tree');
//     // $('nbPersonsInput').value=initialNbPersonsInput;
//     // createPersons(initialNbPersonsInput);
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
        const randomNbChilds = Math.ceil(Math.random() * 5); /* breadth-first generating, up to 5 childs */
        const nbChilds = Math.min(randomNbChilds, remainingPersons);
        for (let i=nbChilds; i>0; i--) {
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
    displayPersons();
}

function displayPersons() {
    $("treeContainer").innerHTML = "";
    $("treeContainer").appendChild(applyListItemTemplate(randomTree));
    recDisplayPersons(randomTree);
}

function recDisplayPersons(person) {

    // const firstPerson = persons[0];
    // for (key in firstPerson) {
    //     domTree.innerHTML += `<li>${key}</li>`;
    //     if (typeof firstPerson[key] == 'string');
    // }

    // TODO show DOM tree branches from random tree
}

// TODO add a (relative) path? callable from DOM element? return new DOM element?
function applyListItemTemplate(personTreeNode) {
    const childsToDisplay = personTreeNode.childNodes;
    for (let cNode of childsToDisplay) {
        const cData = personsData[cNode.jsonIndex];
        let personDisplay = document.createElement("person-display");
        personDisplay.id = "person"+cNode.jsonIndex;
        // personDisplay.setAttribute(cNode.jsonIndex); //TODO
        // personDisplay.classList.add("nested");
        personDisplay.innerHTML =
            // `<div slot="id"></div>
            // <span slot="first">${cData.name.first}</span>
            // <span slot="last">${cData.name.last}</span>
            // <a slot="script" class=>${JSON.stringify(cData)}</a>
            // `;

            //FIXME whole function
            `<a slot="script" class=>${JSON.stringify(cData)}</a>`;

        // `<li id=${cNode.jsonIndex} person=${cNode} classList="caret">\
        // \    ${cData.name.first} \
        // \    ${cData.name.last} \
        // </li>`;
        return personDisplay;
    }
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
        //TODO directly in HTML ?
}

/* #endregion */