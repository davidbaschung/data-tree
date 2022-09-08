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

async function fetchPersons(amount, storageFunction) {
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
            storageFunction(json.results);
            return json.results;
        })
        .catch(async () => {
            log("JSON file request : failed")
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return fetchFile();
        }); 
    }
    var x = await fetchFile();
    console.log("x",x);
    return x;
}