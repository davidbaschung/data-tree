export default {
//     install: function(Vue,) {
//         Object.defineProperty(Vue.prototype, 'log', {value:log});
//         Object.defineProperty(Vue.prototype, 'fetchPersons', {value:fetchPersons});
//     },
    log,
    fetchPersons,
}


function log(tag='', ...contents) {
    if (contents) {
        console.log(`${tag} (below) :`);
        for (let content of contents) {
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

async function fetchPersons(amount) {
    async function fetchFile() {
        return fetch(
            `https://randomuser.me/api?results=${amount}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'json',
                },
            },
        ).then( (response) => {
            if (response.ok)
                return response.json();
            else
                log("JSON file request : bad answer");
        })
        .then( (json) => {
            return json.results;
        })
        .catch(async () => {
            log("JSON file request : failed")
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return fetchFile();
        }); 
    }
    var fetchedFile = await fetchFile();
    console.log("fetched File", fetchedFile);
    return fetchedFile;
}