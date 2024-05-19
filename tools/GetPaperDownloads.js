/*

- This script will get all the paper downloads from the website and print them to the console
- Run it via the console on "https://papermc.io/downloads/all" and it will print all the links to the console
- You may have to run it twice, as the website loads the text in the first time.
- Once done, run logDictionary()
*/

var arr = []
var exit = false;
var children = Array.from(document.querySelector("nav.p-2").children);
var i = 0;
var max = children.length + 1;
var logged = false;

var extract_version_from_url = /https\:\/\/api\.papermc\.io\/v2\/projects\/paper\/versions\/(1\.\d+\.?\d?(?:-pre7)?)\/builds\/\d+\/downloads\/.+\.jar/

setInterval(_=>{

	let x = children[i]

	if (!x || x.innerHTML === 'Waterfall' || x.innerHTML === 'Velocity') exit = true

//console.log(x.innerHTML)

	
	if (exit) {
		if (!logged) {
			console.log(`[${arr.map(x=>`"${x}"`).join(",")}]`)
			logged = true;
		}
		return;
	}
	if (i > max || !x) return
	x?.click();

	setTimeout(()=>{
		if (exit) return;
        let el = document.querySelector('[class^="SoftwareBuildsTable_body"]>tr>td>div>div>a')
        console.log(el.href)
        arr.push(el.href)
        i++
	}, 50)
}, 200)


function logDictionary() {
    var downloads_dict = {}
    for (const link of arr) {
        if (!link.includes('projects/paper')) continue
        console.log(link, typeof link, link.toString(), link.includes('products/paper'))
        downloads_dict[`paper-${link.match(extract_version_from_url)[1]}`] = link
    }
    console.log(JSON.stringify(downloads_dict))
}