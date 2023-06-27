/*

- This script will get all the paper downloads from the website and print them to the console
- Run it via the console on "https://papermc.io/downloads/all" and it will print all the links to the console
- You may have to run it twice, as the website loads the text in the first time.

*/

var arr = []
var exit = false;
var children = Array.from(document.querySelector("nav.p-2").children);
var i = 0;
var max = children.length + 1;
var logged = false;

setInterval(_=>{

	let x = children[i]

	if (x.innerHTML === 'Waterfall' || x.innerHTML === 'Velocity') exit = true

//console.log(x.innerHTML)

	
	if (exit) {
		if (!logged) {
			console.log(`[${arr.map(x=>`"${x}"`).join(",")}]`)
			logged = true;
		}
		return;
	}
	if (i > max || !x) return;
	x.click();

	setTimeout(()=>{
		if (exit) return;
    let el = document.querySelector(".SoftwareBuildsTable_body__0QhzK>tr>td>div>div>a")
    console.log(el.href)
     arr.push(el.href)
    i++
	}, 50)
}, 200)