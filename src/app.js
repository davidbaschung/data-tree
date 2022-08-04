/*  #region utils */

function $(id) {
    return document.getElementById(id);
}
function log(tag='', content) {
    if (content) {
        console.log(tag + " (below) :");
        console.log(content);
        console.log();
    } else {
        if (tag)
            console.log(tag)
        else
            console.log("test log");
    }
}

/* #endregion */



/*  #region SPA script */

var nbPersons = 3;
var persons = [];

/*  onPageLoaded is called later */

/* #endregion */



/* #region SPA methods */

function onPageLoaded() {
    $('nbPersonsInput').value=nbPersons;
    displayPersons(nbPersons);
    // loadPersons(nbPersons).then( () => {
    //     displayPersons("personsList");
    // });
}

function displayPersons(amount) {
    log("amount",amount);
    nbPersons = amount;
    loadPersons(amount).then( () => {
        $("personsList").innerHTML = JSON.stringify(persons);
    });
}

async function loadPersons(amount) {
    $("loading").removeAttribute("hidden");

    async function fetchFile() {  // TODO do-while?
        var file = await fetch(
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
            persons = json.results;
        }).catch(() => {
            log("JSON file request : failed")
            fetchFile();
        });
    }

    await fetchFile();

    $("loading").setAttribute("hidden",'');
}

function nbPersonsInput($event, amount) {
    if ($event.keyCode==13) {
        displayPersons(amount);
        // TODO some REGEX check
    }
}
//TODO recursive function

/* #endregion */