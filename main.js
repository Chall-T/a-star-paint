
const rows = 80;
const columns = 50;
const cell_size = 10;

const c = document.querySelector('canvas');
const c_i = document.querySelector('#cell-index');
const ctx = c.getContext('2d');

var mouse = {x: undefined, y: undefined, isClicked: false};
var grid, swatch;

const def_color_array = ["#808080", "#00e600", "#e60000", "#882FF6", "#37B6F6"];


c.addEventListener("mousemove",(e)=> {
	// mouse_coordinate - element_position_offset - border_width
    mouse.x = e.clientX-c.offsetLeft-20;
   	mouse.y = e.clientY-c.offsetTop-20;
});
c.addEventListener("mousedown",(e)=> mouse.isClicked = true);
c.addEventListener("mouseup",(e)=> {mouse.isClicked = false; grid.drawPath()});


// Initialization
function init() {
	grid = new Grid(rows, columns, cell_size);
	swatch = new Swatch(def_color_array);
	swatch.setSwatchView();
	grid.cells[grid.start_cell[0]][grid.start_cell[1]].onClick(swatch.colors[2]);
	grid.cells[grid.end_cell[0]][grid.end_cell[1]].onClick(swatch.colors[3]);
	grid.drawPath()

    animate();
	
}

function animate() {
    requestAnimationFrame(animate);
	ctx.clearRect(0, 0, rows*cell_size, columns*cell_size);
	grid.update(mouse, ctx)
	
	
}
init();


function displayCellIndex(x, y) {
	c_i.innerHTML = x + ", " + y;
}